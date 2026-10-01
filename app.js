(() => {
  'use strict';

  const apiBase = 'https://mgt3745-hw4.semajjohnson.workers.dev';
  const maxTrackLength = 200;
  const maxSourceLength = 60;
  const maxLabelLength = 30;

  const poolForm = document.querySelector('#pool-form');
  const trackInput = document.querySelector('#track-input');
  const sourceInput = document.querySelector('#source-input');
  const poolList = document.querySelector('#pool-list');
  const formError = document.querySelector('#form-error');
  const saveStatus = document.querySelector('#save-status');
  const emptyState = document.querySelector('#empty-state');
  const filterSection = document.querySelector('#filter-section');
  const filterButtons = document.querySelector('#filter-buttons');
  const activeFilterDisplay = document.querySelector('#active-filter-display');
  const activeFilterLabel = document.querySelector('#active-filter-label');
  const clearFilterButton = document.querySelector('#clear-filter');

  // ?apiDown points the page at a path the Worker does not answer, so the
  // failed-response path can be demonstrated without taking the server down.
  const api = new URLSearchParams(window.location.search).has('apiDown')
    ? apiBase + '/not-a-real-endpoint'
    : apiBase + '/entries';

  let poolItems = [];
  let activeFilter = null;

  function showError(message) {
    formError.textContent = message;
    saveStatus.textContent = '';
  }

  // The server returns one row per track-and-person pair, so a track
  // recommended by two people is merged here for display (A6). Labels are
  // unioned the same way, since a label belongs to the track the user sees.
  function mergeByTrack(rows) {
    const merged = [];
    rows.forEach(row => {
      const labels = row.labels || [];
      const match = merged.find(item => item.track.toLowerCase() === row.track.toLowerCase());
      if (match) {
        match.sources.push(row.source);
        match.ids.push(row.id);
        labels.forEach(label => {
          if (!match.labels.some(existing => existing.toLowerCase() === label.toLowerCase())) {
            match.labels.push(label);
          }
        });
      } else {
        merged.push({
          track: row.track,
          sources: [row.source],
          ids: [row.id],
          labels: [...labels],
          createdAt: row.created_at
        });
      }
    });
    return merged;
  }

  async function loadPool() {
    try {
      const response = await fetch(api);
      if (!response.ok) {
        showError('Could not load the pool. The server returned ' + response.status + '.');
        return [];
      }
      return mergeByTrack(await response.json());
    } catch {
      // A network failure must say so on the page rather than only in the console.
      showError('Could not reach the server. Check your connection and reload.');
      return [];
    }
  }

  async function savePool(track, source) {
    try {
      const response = await fetch(api, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ track, source })
      });
      if (response.ok) return true;
      // The Worker's 400 messages name the problem, so they are shown as written.
      showError(await response.text());
      return false;
    } catch {
      showError('Could not reach the server. Your entry was not saved.');
      return false;
    }
  }

  // A label is applied to every row behind a merged item, so it survives when
  // one of the people who recommended the track is dismissed.
  async function addLabel(item, rawLabel) {
    const label = rawLabel.trim();
    if (!label) {
      showError(`Enter a mood label of 1 to ${maxLabelLength} characters.`);
      return false;
    }
    if (label.length > maxLabelLength) {
      showError(`Mood labels must be ${maxLabelLength} characters or fewer.`);
      return false;
    }

    let anyAdded = false;
    let lastMessage = '';
    for (const id of item.ids) {
      try {
        const response = await fetch(apiBase + '/entries/' + id + '/labels', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ label })
        });
        if (response.ok) anyAdded = true;
        else lastMessage = await response.text();
      } catch {
        showError('Could not reach the server. The label was not saved.');
        return false;
      }
    }

    if (!anyAdded) {
      showError(lastMessage || 'That label could not be added.');
      return false;
    }
    return true;
  }

  async function removeLabel(item, label) {
    for (const id of item.ids) {
      try {
        await fetch(apiBase + '/entries/' + id + '/labels/remove', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ label })
        });
      } catch {
        showError('Could not reach the server. The label was not removed.');
        return false;
      }
    }
    return true;
  }

  async function dismissItem(item) {
    for (const id of item.ids) {
      try {
        const response = await fetch(apiBase + '/entries/' + id + '/dismiss', { method: 'POST' });
        if (!response.ok) {
          showError('Could not dismiss that item. The server returned ' + response.status + '.');
          return;
        }
      } catch {
        showError('Could not reach the server. Nothing was dismissed.');
        return;
      }
    }
    await refresh();
    saveStatus.textContent = 'Dismissed. It will not come back from those people.';
  }

  function formatSources(sources) {
    if (sources.length === 1) return sources[0];
    return `${sources.slice(0, -1).join(', ')} and ${sources[sources.length - 1]}`;
  }

  function formatDate(text) {
    const parsed = new Date(text.replace(' ', 'T') + 'Z');
    return Number.isNaN(parsed.getTime())
      ? text
      : parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Only labels a user has placed are offered as filters. Nothing is suggested,
  // generated, or pre-populated (A13).
  function availableLabels() {
    const labels = [];
    poolItems.forEach(item => {
      item.labels.forEach(label => {
        if (!labels.some(existing => existing.toLowerCase() === label.toLowerCase())) {
          labels.push(label);
        }
      });
    });
    return labels.sort((a, b) => a.localeCompare(b));
  }

  function renderFilters() {
    const labels = availableLabels();
    filterButtons.replaceChildren();
    filterSection.hidden = labels.length === 0;

    labels.forEach(label => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-button';
      button.textContent = label;
      button.setAttribute('aria-pressed', String(activeFilter === label));
      button.addEventListener('click', () => {
        activeFilter = activeFilter === label ? null : label;
        renderFilters();
        renderPool();
      });
      filterButtons.append(button);
    });

    // A14: while a filter is active the page names it and offers a way out.
    activeFilterDisplay.hidden = activeFilter === null;
    activeFilterLabel.textContent = activeFilter || '';
  }

  function buildLabelControls(item) {
    const labelRow = document.createElement('div');
    labelRow.className = 'item-labels';

    item.labels.forEach(label => {
      const chip = document.createElement('span');
      chip.className = 'label-chip';
      chip.textContent = label;

      const removeLabelButton = document.createElement('button');
      removeLabelButton.type = 'button';
      removeLabelButton.className = 'label-remove';
      removeLabelButton.textContent = 'x';
      removeLabelButton.setAttribute('aria-label', `Remove label ${label} from ${item.track}`);
      removeLabelButton.addEventListener('click', async () => {
        if (await removeLabel(item, label)) {
          if (activeFilter === label) activeFilter = null;
          await refresh();
          saveStatus.textContent = `Removed the label ${label}.`;
        }
      });

      chip.append(removeLabelButton);
      labelRow.append(chip);
    });

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.className = 'label-input';
    labelInput.maxLength = maxLabelLength;
    labelInput.placeholder = 'Add a label';
    labelInput.setAttribute('aria-label', `Add a mood label to ${item.track}`);

    const addLabelButton = document.createElement('button');
    addLabelButton.type = 'button';
    addLabelButton.className = 'label-add';
    addLabelButton.textContent = 'Add label';
    addLabelButton.addEventListener('click', async () => {
      const value = labelInput.value;
      if (await addLabel(item, value)) {
        formError.textContent = '';
        await refresh();
        saveStatus.textContent = `Labelled ${item.track} as ${value.trim()}.`;
      }
    });

    labelRow.append(labelInput, addLabelButton);
    return labelRow;
  }

  function renderPool() {
    poolList.replaceChildren();

    // A11: with a filter active, only items carrying that label are shown.
    const visible = activeFilter === null
      ? poolItems
      : poolItems.filter(item => item.labels.some(label => label.toLowerCase() === activeFilter.toLowerCase()));

    emptyState.hidden = visible.length > 0;
    emptyState.textContent = poolItems.length === 0
      ? 'Nothing in the pool yet.'
      : 'Nothing in the pool carries that label.';

    visible.forEach(item => {
      const listItem = document.createElement('li');
      const details = document.createElement('div');
      details.className = 'item-details';

      const trackText = document.createElement('span');
      trackText.className = 'item-track';
      trackText.textContent = item.track;

      const metaText = document.createElement('span');
      metaText.className = 'item-meta';
      metaText.textContent = `from ${formatSources(item.sources)} · added ${formatDate(item.createdAt)}`;

      details.append(trackText, metaText, buildLabelControls(item));

      const dismissButton = document.createElement('button');
      dismissButton.type = 'button';
      dismissButton.className = 'remove-button';
      dismissButton.textContent = 'Dismiss';
      dismissButton.setAttribute('aria-label', `Dismiss ${item.track}`);
      dismissButton.addEventListener('click', () => dismissItem(item));

      listItem.append(details, dismissButton);
      poolList.append(listItem);
    });
  }

  async function refresh() {
    poolItems = await loadPool();
    if (activeFilter !== null && !availableLabels().some(label => label === activeFilter)) {
      activeFilter = null;
    }
    renderFilters();
    renderPool();
  }

  function showFieldError(message, field) {
    field.setAttribute('aria-invalid', 'true');
    showError(message);
    field.focus();
  }

  clearFilterButton.addEventListener('click', () => {
    activeFilter = null;
    renderFilters();
    renderPool();
  });

  poolForm.addEventListener('submit', async event => {
    event.preventDefault();
    trackInput.removeAttribute('aria-invalid');
    sourceInput.removeAttribute('aria-invalid');
    formError.textContent = '';

    const track = trackInput.value.trim();
    const source = sourceInput.value.trim();

    if (track.length < 1 || track.length > maxTrackLength) {
      showFieldError(`Enter a track of 1 to ${maxTrackLength} characters.`, trackInput);
      return;
    }
    if (source.length < 1 || source.length > maxSourceLength) {
      showFieldError(`Enter the name of the person this came from, 1 to ${maxSourceLength} characters.`, sourceInput);
      return;
    }

    if (!await savePool(track, source)) return;

    await refresh();
    trackInput.value = '';
    sourceInput.value = '';
    trackInput.focus();
    saveStatus.textContent = `Added to the pool from ${source}.`;
  });

  refresh();
})();