import { getAssets } from '../api.js';

export class AssetBrowser {
    constructor(assetSelector, options = {}) {
        this.assetBrowser  = assetSelector;
        this.input         = assetSelector.querySelector('.searchbar input');
        this.cancelButton  = assetSelector.querySelector('.searchbar-cancel');
        this.wrapper       = assetSelector.querySelector('.asset-wrapper');
        this.currentSlot   = null;
        this.searchTimeout = null;
        this.gameSlug      = options.gameSlug || null;
    }

    init() {
        document.body.appendChild(this.assetBrowser);

        this.input.addEventListener('input', (e) => {
            this.cancelButton.classList.toggle('is-hidden', !e.target.value);
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.filterAssets(e.target.value.trim());
            }, 400);
        });

        this.cancelButton.addEventListener('click', () => {
            this.input.value = '';
            this.cancelButton.classList.add('is-hidden');
            this.filterAssets('');
        });

        document.querySelectorAll('.slot-item').forEach(slot => {
            slot.addEventListener('click', (e) => this.openBrowser(e, slot));
        });

        // metadata buttons
        document.querySelectorAll('.metadata-item button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const metadataItem = btn.closest('.metadata-item');
                this.openBrowser(e, metadataItem);
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.slot-item') &&
                !e.target.closest('.asset-browser') &&
                !e.target.closest('.metadata-item')) {
                this.closeBrowser();
            }
        });
    }

    openBrowser(e, slot) {
        e.stopPropagation();

        const isOpen = slot === this.currentSlot;
        this.closeBrowser();
        if (isOpen) return;

        this.assetBrowser.querySelector('h2').textContent =
            (slot.dataset.slotCategory || slot.dataset.slotType || '').toUpperCase();

        this.currentSlot = slot;
        this.input.value = '';
        this.cancelButton.classList.add('is-hidden');
        this.assetBrowser.classList.remove('is-hidden');
        this.filterAssets('');
    }

    async filterAssets(query = '') {
        this.wrapper.innerHTML = '';
        const types= (this.currentSlot.dataset.slotTypes || this.currentSlot.dataset.slotType || '').split(',');
        const category = this.currentSlot.dataset.slotCategory || '';

        try {
            const results = await Promise.all(
                types.map(type =>
                    getAssets({ limit: 35, name: query, type: type.trim(), category, gameSlug: this.gameSlug })
                )
            );

            const assets = results.flatMap(data => Array.isArray(data.assets) ? data.assets : []);
            this.renderAssets(assets);
        } catch {
            this.wrapper.innerHTML = '<p style="color:var(--color-text-muted)">Could not load assets.</p>';
        }
    }

    renderAssets(assets) {
        this.wrapper.innerHTML = '';

        if (!assets.length) {
            this.wrapper.innerHTML = '<p style="color:var(--color-text-muted)">No items found.</p>';
            return;
        }

        for (const asset of assets) {
            const item = document.createElement('div');
            item.className   = 'asset-item';
            item.dataset.assetId = asset.id;

            const img = document.createElement('img');
            img.src = asset.iconUrl || '';
            img.alt = asset.name;

            img.addEventListener('mouseenter', (e) => {
                this.assetBrowser.dispatchEvent(new CustomEvent('asset-hover', {
                    detail: { asset, anchor: e.target }
                }));
            });
            img.addEventListener('mouseout', () => {
                this.assetBrowser.dispatchEvent(new CustomEvent('asset-hover-out'));
            });
            img.addEventListener('click', () => this.selectAsset(asset));

            item.appendChild(img);
            this.wrapper.appendChild(item);
        }
    }

    selectAsset(asset) {
        const slotName = this.currentSlot.dataset.slotName;
        this.assetBrowser.dispatchEvent(new CustomEvent('asset-selected', {
            detail: { asset, slotName }
        }));
        this.closeBrowser();
    }

    closeBrowser() {
        this.assetBrowser.classList.add('is-hidden');
        this.currentSlot = null;
    }
}