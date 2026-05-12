import {NotificationHandler} from './helpers/notification.js';
import {TooltipHandler} from './helpers/tooltip.js';
import {AssetBrowser} from './helpers/browser.js';
import {createBuild, deleteBuild, updateBuild} from './api.js'

const notification= document.querySelector('.notification');
const notificationHandler = new NotificationHandler(notification);

const deleteButton = document.getElementById('btn-delete') || null;
const submitButton = document.getElementById('btn-save') || null;
const discardButton = document.getElementById('btn-discard') || null;

const gameSlug= document.querySelector('main').dataset.gameSlug;
const isOwner= document.querySelector('main').dataset.isOwner === 'true';
const buildRaw= document.querySelector('main').dataset.build;
const buildData = buildRaw ? JSON.parse(buildRaw) : null;

const buildIdRaw = document.querySelector('main').dataset.buildId;
const buildId= buildIdRaw && buildIdRaw !== 'null' ? buildIdRaw : null;

let buildSlots = {};

let state = {
    name: buildData?.name ?? '',
    description: buildData?.description ?? '',
    isPublic: buildData?.isPublic ?? true,
    tags: buildData?.tags ?? [],
    version: buildData?.version ?? null,
    gameVersion: buildData?.gameVersion ?? null,
    buildSlots,
};

if (buildData) {
    document.getElementById('build-name').value = buildData.name ?? '';
    document.getElementById('build-desc').value = buildData.description ?? '';
    document.getElementById('build-game-version').value = buildData.gameVersion ?? '';
    document.getElementById('build-version').value = buildData.version ?? '';
}

class SlotHandler {

    static init(buildSlots, assetBrowser) {
        assetBrowser.assetBrowser.addEventListener('asset-selected', (e) => {
            const { asset, slotName } = e.detail;
            buildSlots[slotName] = asset;

            const el = document.querySelector(`[data-slot-name="${slotName}"]`);
            if (!el) return;

            if (el.classList.contains('metadata-item')) {
                SlotHandler.populateMetadata(el, asset);
            } else {
                SlotHandler.populateSlot(el, asset);
            }
        });

        document.querySelectorAll('.slot-clear').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const slot     = btn.closest('.slot-item');
                const slotName = slot.dataset.slotName;
                buildSlots[slotName] = '';
                SlotHandler.clearSlot(slot, buildSlots);
            });
        });
    }

    static populateSlot(slot, asset, isOwner = true, buildSlots = {}) {
        const placeholder = slot.querySelector('.slot-placeholder');
        const image = slot.querySelector('.slot-image');
        const clearBtn = slot.querySelector('.slot-clear');
        const metadata = slot.querySelector('.slot-metadata');

        image.src = asset.iconUrl || '';
        image.alt = asset.name;
        image.classList.remove('is-hidden');
        placeholder.classList.add('is-hidden');

        if (isOwner) {
            clearBtn.classList.remove('is-hidden');
        }

        if (metadata) {
            if (!asset.data?.compatible) {
                metadata.classList.add('is-hidden');
            } else if (!isOwner) {
                metadata.querySelectorAll('.metadata-item').forEach(item => {
                    const slotName = item.dataset.slotName;
                    const hasRelic = !!buildSlots[slotName];
                    item.classList.toggle('is-hidden', !hasRelic);

                    if (hasRelic) {
                        const btn = item.querySelector('button');
                        if (btn) btn.classList.add('is-hidden');
                    }
                });

                const anyRelic = Array.from(metadata.querySelectorAll('.metadata-item'))
                    .some(item => !!buildSlots[item.dataset.slotName]);
                metadata.classList.toggle('is-hidden', !anyRelic);
            } else {
                metadata.classList.remove('is-hidden');
            }
        }
    }

    static clearSlot(slot, buildSlots) {
        const placeholder = slot.querySelector('.slot-placeholder');
        const image       = slot.querySelector('.slot-image');
        const clearBtn    = slot.querySelector('.slot-clear');
        const metadata    = slot.querySelector('.slot-metadata');

        image.src = '';
        image.alt = '';
        image.classList.add('is-hidden');
        placeholder.classList.remove('is-hidden');
        clearBtn.classList.add('is-hidden');

        if (metadata) {
            metadata.classList.add('is-hidden');
            metadata.querySelectorAll('.metadata-item').forEach(item => {
                if (item.dataset.slotName) buildSlots[item.dataset.slotName] = '';
                SlotHandler.clearMetadata(item);
            });
        }

        slot.dispatchEvent(new CustomEvent('slot-cleared', { bubbles: true }));
    }

    static populateMetadata(metadataItem, asset) {
        const btn = metadataItem.querySelector('button');

        let img = metadataItem.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            metadataItem.appendChild(img);
        }
        img.src = asset.iconUrl || '';
        img.alt = asset.name;

        if (btn) btn.classList.add('is-hidden');
    }

    static clearMetadata(metadataItem) {
        const btn = metadataItem.querySelector('button');
        const img = metadataItem.querySelector('img');

        if (img) img.remove();
        if (btn) btn.classList.remove('is-hidden');

        metadataItem.dispatchEvent(new CustomEvent('metadata-cleared', { bubbles: true }));
    }
}

class TagSelector {
    constructor(state) {
        this.state = state;
        this.ALL_TAGS = [
            { value: 'beginner-friendly', label: 'Beginner Friendly' },
            { value: 'endgame',           label: 'Endgame'           },
            { value: 'solo',              label: 'Solo'              },
            { value: 'co-op',             label: 'Co-op'             },
            { value: 'speedrun',          label: 'Speedrun'          },
            { value: 'tank',              label: 'Tank'              },
            { value: 'glass-cannon',      label: 'Glass Cannon'      },
            { value: 'stealth',           label: 'Stealth'           },
            { value: 'magic-focused',     label: 'Magic'             },
            { value: 'melee-focused',     label: 'Melee'             },
            { value: 'ranged-focused',    label: 'Ranged'            },
            { value: 'hybrid',            label: 'Hybrid'            },
            { value: 'min-maxed',         label: 'Min-Maxed'         },
            { value: 'budget',            label: 'Budget'            },
        ];
        this.MAX_TAGS = 3;

        this.sel     = document.getElementById('tag-selected');
        this.ctr     = document.getElementById('tag-counter');
        this.dd      = document.getElementById('tag-dropdown');
        this.trigger = document.getElementById('tag-trigger');

        this.#bindEvents();
        this.render();
    }

    #bindEvents() {
        this.trigger.addEventListener('click', () => this.dd.classList.toggle('open'));

        document.addEventListener('mousedown', e => {
            if (!e.target.closest('#tag-select')) this.dd.classList.remove('open');
        });
    }

    addTag(v) {
        if (this.state.tags.length >= this.MAX_TAGS || this.state.tags.includes(v)) return;
        this.state.tags.push(v);
        this.render();
    }

    removeTag(v) {
        this.state.tags = this.state.tags.filter(t => t !== v);
        this.render();
    }

    getTags() {
        return [...this.state.tags];
    }

    render() {
        this.ctr.textContent = `(${this.state.tags.length}/${this.MAX_TAGS})`;

        if (this.state.tags.length === 0) {
            this.sel.innerHTML = '<span class="tag-select__placeholder">Select up to 3 tags…</span>';
        } else {
            this.sel.innerHTML = this.state.tags.map(tag => {
                const l = this.ALL_TAGS.find(t => t.value === tag)?.label || tag;
                return `<span class="tag-chip">${l}<button class="tag-chip__remove" data-tag="${tag}">×</button></span>`;
            }).join('');

            this.sel.querySelectorAll('.tag-chip__remove').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    this.removeTag(btn.dataset.tag);
                });
            });
        }

        const avail      = this.ALL_TAGS.filter(t => !this.state.tags.includes(t.value));
        const maxReached = this.state.tags.length >= this.MAX_TAGS;

        if (avail.length === 0) {
            this.dd.innerHTML = '<div class="tag-select__option disabled">All tags selected</div>';
        } else {
            this.dd.innerHTML = avail.map(t =>
                `<div class="tag-select__option ${maxReached ? 'disabled' : ''}" data-value="${t.value}">${t.label}</div>`
            ).join('');

            if (!maxReached) {
                this.dd.querySelectorAll('.tag-select__option').forEach(opt => {
                    opt.addEventListener('click', () => this.addTag(opt.dataset.value));
                });
            }
        }
    }

    disable() {
        this.trigger.disabled = true;
        this.trigger.style.display = 'none';
        this.sel.style.pointerEvents = 'none';
        this.sel.querySelector('.tag-select__placeholder') &&
        (this.sel.querySelector('.tag-select__placeholder').style.display = 'none');

        document.getElementById('tag-select').classList.add('tag-select--disabled');
    }
}

const assetSelector  = document.querySelector('.asset-browser');
const assetBrowser   = new AssetBrowser(assetSelector, { gameSlug });
const tooltipHandler = new TooltipHandler(gameSlug);
const tagSelector = new TagSelector(state);

(async () => {
    if (isOwner) {
        assetBrowser.init();
        SlotHandler.init(buildSlots, assetBrowser);
    }

    tooltipHandler.init(buildSlots, assetBrowser);

    if (buildData?.assets) {
        populateBuildSlots(buildData.assets);
    }

    if (!isOwner) tagSelector.disable();
})();

function populateBuildSlots(assets) {
    if (!assets?.length) return;

    assets.forEach(asset => {
        const { slotName } = asset;
        if (!slotName) return;
        buildSlots[slotName] = asset;
    });

    assets.forEach(asset => {
        const { slotName } = asset;
        if (!slotName) return;

        const el = document.querySelector(`[data-slot-name="${slotName}"]`);
        if (!el) return;

        if (el.classList.contains('metadata-item')) {
            SlotHandler.populateMetadata(el, asset);
        } else {
            SlotHandler.populateSlot(el, asset, isOwner, buildSlots);
        }
    });
}

document.querySelectorAll('[data-visibility]').forEach(c => {
    c.addEventListener('click', () => {
        document.querySelectorAll('[data-visibility]').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        state.isPublic = c.dataset.visibility === 'public';
    });
});

const SEMVER_REGEX = /^\d+\.\d+(\.\d+)?$/;

function validateField(inputId, errorId, { required = false, regex = null, regexMessage = '', stateKey = null } = {}) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    const val   = input.value.trim();

    if (required && !val) {
        input.classList.add('error');
        error.textContent = 'This field is required';
        error.style.display = '';
        if (stateKey) state[stateKey] = null;
        return false;
    }

    if (regex && val && !regex.test(val)) {
        input.classList.add('error');
        error.textContent = regexMessage;
        error.style.display = '';
        if (stateKey) state[stateKey] = null;
        return false;
    }

    input.classList.remove('error');
    error.style.display = 'none';
    if (stateKey) state[stateKey] = val || null;
    return true;
}

function validateForm() {
    const nameValid= validateField('build-name', 'error-build-name', { required: true });
    const descValid= validateField('build-desc', 'error-build-desc', { required: true });
    const gameVersionValid= validateField('build-game-version', 'error-game-version', { regex: SEMVER_REGEX, regexMessage: 'Format: 1.0 or 1.0.0', stateKey: 'gameVersion', required: true });
    const versionValid= validateField('build-version', 'error-build-version', { regex: SEMVER_REGEX, regexMessage: 'Format: 1.0 or 1.0.0', stateKey: 'version', required: true });

    return nameValid && descValid && gameVersionValid && versionValid;
}

if (isOwner) {
    submitButton.addEventListener('click', async e => {
        e.preventDefault();

        state.name = document.getElementById('build-name').value;
        state.description = document.getElementById('build-desc').value;
        state.gameVersion = document.getElementById('build-game-version').value;
        state.version = document.getElementById('build-version').value;

        if (!validateForm()) return;

        const assets = Object.entries(buildSlots)
            .filter(([_, asset]) => asset && asset.id)
            .map(([slotName, asset]) => ({
                assetId:      asset.id,
                slotCategory: slotName.startsWith('ash-of-war') ? 'ashOfWar' : asset.type,
                slotName:     slotName,
            }));

        const buildPayload = {
            gameSlug,
            name:        state.name,
            description: state.description,
            isPublic:    state.isPublic,
            version:     state.version,
            gameVersion: state.gameVersion,
            tags:        state.tags,
            assets,
        };

        try {
            if (!buildId) {
                const res = await createBuild(buildPayload);
                notificationHandler.displayNotification('success', 'Build created Successfully');
                setTimeout(() => window.location.replace(`/games/${gameSlug}/builds/${res.id}`), 2000);
            } else {
                await updateBuild(buildPayload, buildId);
                notificationHandler.displayNotification('success', 'Build updated Successfully');
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (e) {
            switch (e.status) {
                case 400: {
                    notificationHandler.displayNotification('warning', 'Build cannot be validated');
                    break;
                }
                case 401: {
                    notificationHandler.displayNotification('warning', 'Session expired');
                    setTimeout(() => window.location.replace(`/auth`), 2000);
                    break;
                }
                case 429: {
                    notificationHandler.displayNotification('warning', 'Too many attempts. Try again later');
                    break;
                }
                default: {
                    notificationHandler.displayNotification('error', 'Server Error');
                }
            }

        }
    });
    discardButton.addEventListener('click', e => {
        e.preventDefault();

        document.getElementById('build-name').value = buildData?.name ?? '';
        document.getElementById('build-desc').value = buildData?.description ?? '';
        document.getElementById('build-game-version').value = buildData?.gameVersion ?? '';
        document.getElementById('build-version').value = buildData?.version ?? '';

        state.tags = buildData?.tags ? [...buildData.tags] : [];
        tagSelector.render();

        document.querySelectorAll('.slot-item').forEach(slot => {
            const slotName = slot.dataset.slotName;
            buildSlots[slotName] = '';
            SlotHandler.clearSlot(slot, buildSlots);
        });

        if (buildData?.assets) {
            populateBuildSlots(buildData.assets);
        }
    });
    if (deleteButton)
        deleteButton.addEventListener('click', async e => {
        e.preventDefault();

        try {
            await deleteBuild(buildId);

            notificationHandler.displayNotification('success', 'Build deleted successfully');

            setTimeout(() => {
                window.location.replace('/')
            }, 2000);
        } catch (e) {
            notificationHandler.displayNotification('error', e.status);
        }
    })
}