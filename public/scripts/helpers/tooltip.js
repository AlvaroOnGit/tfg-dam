export class TooltipHandler {
    constructor(gameSlug) {
        this.gameSlug = gameSlug;
        this.tooltip  = document.createElement('div');
        this.tooltip.className = 'tooltip is-hidden';
        document.body.appendChild(this.tooltip);

        this.renderers = {
            'elden-ring': new EldenRingTooltipRenderer(),
            'tainted-grail': new TaintedGrailTooltipRenderer(),
        };
    }

    init(buildSlots, assetBrowser) {
        document.querySelectorAll('.slot-item').forEach(slot => {
            slot.addEventListener('mouseenter', () => {
                const asset = buildSlots[slot.dataset.slotName];
                if (!asset) return;
                this.show(slot, asset);
            });
            slot.addEventListener('mouseleave', () => this.hide());
        });

        document.querySelectorAll('.metadata-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                const asset = buildSlots[item.dataset.slotName];
                if (!asset) return;
                this.show(item, asset);
            });
            item.addEventListener('mouseleave', () => this.hide());
        });

        assetBrowser.assetBrowser.addEventListener('asset-hover', (e) => {
            this.show(e.detail.anchor, e.detail.asset);
        });
        assetBrowser.assetBrowser.addEventListener('asset-hover-out', () => this.hide());
        document.addEventListener('slot-cleared', () => this.hide());
        document.addEventListener('metadata-cleared', () => this.hide());
    }

    renderTooltipBody(asset) {
        const renderer = this.renderers[this.gameSlug];
        if (!renderer) return '';
        return renderer.render(asset);
    }

    show(anchor, asset) {
        const category = asset.category ?? '';
        this.tooltip.innerHTML = `
            <div class="tooltip-header">
                <h2 class="tooltip-item-name">${asset.name}</h2>
                <h3 class="tooltip-item-type">${asset.type.replace(/[-_]/g, ' ')}${category ? ' - ' + category.replace(/[-_]/g, ' ') : ''}</h3>
            </div>
            <div class="tooltip-image">
                <img src="${asset.iconUrl || ''}" alt="${asset.name}">
            </div>
            ${this.renderTooltipBody(asset)}
        `;

        this.tooltip.classList.remove('is-hidden');

        const rect      = anchor.getBoundingClientRect();
        const tipRect   = this.tooltip.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;

        let left = rect.right + 16;
        if (left + tipRect.width > viewportW) left = rect.left - tipRect.width - 16;

        let top = rect.top;
        if (top + tipRect.height > viewportH) top = viewportH - tipRect.height - 16;

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top  = `${top}px`;
    }

    hide() {
        this.tooltip.classList.add('is-hidden');
    }
}

class EldenRingTooltipRenderer {
    render(asset) {
        const type = asset.type;
        if (type === 'weapon')     return this.renderWeapon(asset);
        if (type === 'armor')      return this.renderArmor(asset);
        if (type === 'spell')      return this.renderSpell(asset);
        if (type === 'ash-of-war') return this.renderAshOfWar(asset);
        if (type === 'spirit-ash') return this.renderSpiritAsh(asset);
        if (type === 'talisman')   return this.renderTalisman(asset);
        return '';
    }

    renderWeapon(asset) {
        const data= asset.data || {};
        const { critical, fire, holy, incantation, lightning, magical, physical, range, sorcery } = data.attack || {};
        const { fire: guardFire, holy: guardHoly, lightning:guardLightning, boost: guardBoost, magical: guardMagical, physical: guardPhysical } = data.guard || {};
        const { arcane, dexterity, faith, intelligence, strength } = data.requires || {};
        const { arcane: arcaneScaling, dexterity: dexterityScaling, faith: faithScaling, intelligence: intelligenceScaling, strength: strengthScaling } = data.scaling || {};
        const skill = data.skill;
        const effect = data.effect;
        const damage = data.damage;
        const weight = data.weight;
        return `
            <div class="tooltip-body">
                <div>
                    <div class="data-section">
                        <div class="section-left">
                            <h2>Attack</h2>
                            <div class="stats"><p>Physical</p><span>${physical}</span></div>
                            <div class="stats"><p style="color:var(--color-magical)">Magical</p><span>${magical}</span></div>
                            <div class="stats"><p style="color:var(--color-fire)">Fire</p><span>${fire}</span></div>
                            <div class="stats"><p style="color:var(--color-lightning)">Lightning</p><span>${lightning}</span></div>
                            <div class="stats"><p style="color:var(--color-holy)">Holy</p><span>${holy}</span></div>
                            <div class="stats"><p style="color:var(--color-critical)">Critical</p><span>${critical}</span></div>
                            ${incantation !== 0 ? `<div class="stats"><p style="color:var(--color-incantation)">Incantation</p><span>${incantation}</span></div>` : ''}
                            ${sorcery !== 0 ? `<div class="stats"><p style="color:var(--color-sorcery)">Sorcery</p><span>${sorcery}</span></div>` : ''}
                            ${range !== 0 ? `<div class="stats"><p style="color:var(--color-range)">Range</p><span>${range}</span></div>` : ''}
                        </div>
                        <div class="section-right">
                            <h2>Guard</h2>
                            <div class="stats"><p>Physical</p><span>${guardPhysical ?? 0}</span></div>
                            <div class="stats"><p style="color:var(--color-magical)">Magical</p><span>${guardMagical ?? 0}</span></div>
                            <div class="stats"><p style="color:var(--color-fire)">Fire</p><span>${guardFire ?? 0}</span></div>
                            <div class="stats"><p style="color:var(--color-lightning)">Lightning</p><span>${guardLightning ?? 0}</span></div>
                            <div class="stats"><p style="color:var(--color-holy)">Holy</p><span>${guardHoly ?? 0}</span></div>
                            <div class="stats"><p style="color:var(--color-boost)">Boost</p><span>${guardBoost ?? 0}</span></div>
                        </div>
                    </div>
                    <div class="separator-horizontal"></div>
                    <div class="data-section">
                        <div class="section-left">
                            <h2>Requirements</h2>
                            ${strength != null ? `<div class="stats"><p>Strength</p><span>${strength}</span></div>` : ''}
                            ${dexterity != null ? `<div class="stats"><p>Dexterity</p><span>${dexterity}</span></div>` : ''}
                            ${intelligence != null ? `<div class="stats"><p>Intelligence</p><span>${intelligence}</span></div>` : ''}
                            ${faith != null ? `<div class="stats"><p>Faith</p><span>${faith}</span></div>` : ''}
                            ${arcane != null ? `<div class="stats"><p>Arcane</p><span>${arcane}</span></div>` : ''}
                        </div>
                        <div class="section-right">
                            <h2>Scaling</h2>
                            ${strengthScaling != null ? `<div class="stats"><p>Strength</p><span>${strengthScaling}</span></div>` : ''}
                            ${dexterityScaling != null ? `<div class="stats"><p>Dexterity</p><span>${dexterityScaling}</span></div>` : ''}
                            ${intelligenceScaling != null ? `<div class="stats"><p>Intelligence</p><span>${intelligenceScaling}</span></div>` : ''}
                            ${faithScaling != null ? `<div class="stats"><p>Faith</p><span>${faithScaling}</span></div>` : ''}
                            ${arcaneScaling != null ? `<div class="stats"><p>Arcane</p><span>${arcaneScaling}</span></div>` : ''}
                        </div>
                    </div>
                    <div class="separator-horizontal"></div>
                    <div class="data-section">
                        <div class="section-left">
                            <h2>Skill</h2>
                            <div class="stats"><p>${skill}</p></div>
                        </div>
                        <div class="section-right">
                            <h2>Damage</h2>
                            <div class="stats"><p>${(damage || []).join(', ')}</p></div>
                            ${effect.value != null ? `<div class="stats"><p>${effect.effect}</p><span>${effect.value}</span></div>` : ''}
                        </div>
                    </div>
                    ${weight != null ? `
                    <div class="section-weight">
                        <div class="stats">
                            <p>${weight}</p>
                            <span class="material-symbols-outlined">weight</span>
                        </div>
                    </div>` : ''}
                </div>
            </div>`;
    }

    renderArmor(asset) {
        const data = asset.data || {};
        const { fire, holy, lightning, magical, physical, pierce, slash, strike } = data.negation   || {};
        const { focus, immunity, poise, robustness, vitality }                    = data.resistance || {};
        const weight = data.weight;

        return `
            <div class="tooltip-body">
                <div class="data-section">
                    <div class="section-left">
                        <h2>Negation</h2>
                        ${physical  ? `<div class="stats"><p>Physical</p><span>${physical}</span></div>` : ''}
                        ${strike    ? `<div class="stats"><p>Strike</p><span>${strike}</span></div>` : ''}
                        ${slash     ? `<div class="stats"><p>Slash</p><span>${slash}</span></div>` : ''}
                        ${pierce    ? `<div class="stats"><p>Pierce</p><span>${pierce}</span></div>` : ''}
                        ${magical   ? `<div class="stats"><p style="color:var(--color-magical)">Magical</p><span>${magical}</span></div>` : ''}
                        ${fire      ? `<div class="stats"><p style="color:var(--color-fire)">Fire</p><span>${fire}</span></div>` : ''}
                        ${lightning ? `<div class="stats"><p style="color:var(--color-lightning)">Lightning</p><span>${lightning}</span></div>` : ''}
                        ${holy      ? `<div class="stats"><p style="color:var(--color-holy)">Holy</p><span>${holy}</span></div>` : ''}
                    </div>
                    <div class="section-right">
                        <h2>Resistance</h2>
                        ${immunity   ? `<div class="stats"><p>Immunity</p><span>${immunity}</span></div>` : ''}
                        ${robustness ? `<div class="stats"><p>Robustness</p><span>${robustness}</span></div>` : ''}
                        ${focus      ? `<div class="stats"><p>Focus</p><span>${focus}</span></div>` : ''}
                        ${vitality   ? `<div class="stats"><p>Vitality</p><span>${vitality}</span></div>` : ''}
                        ${poise      ? `<div class="stats"><p>Poise</p><span>${poise}</span></div>` : ''}
                    </div>
                </div>
                ${weight != null ? `
                <div class="section-weight">
                    <div class="stats">
                        <p>${weight}</p>
                        <span class="material-symbols-outlined">weight</span>
                    </div>
                </div>` : ''}
            </div>`;
    }

    renderSpell(asset) {
        const data        = asset.data || {};
        const description = asset.shortDescription || '';
        const { arcane, faith, intelligence } = data.requirements || {};

        return `
            <div class="tooltip-body">
                <div class="data-section">
                    <div class="section-left">
                        <h2>Spell Type</h2>
                        <div class="stats"><p>${(data.spellType || '').replace(/[-_]/g, ' ')}</p></div>
                    </div>
                    <div class="section-right">
                        <h2>Cost</h2>
                        <div class="stats"><span>${data.cost ?? 0} FP</span></div>
                    </div>
                </div>
                <div class="separator-horizontal"></div>
                <div class="data-section">
                    <div class="section-left">
                        <h2>Requirements</h2>
                        ${intelligence ? `<div class="stats"><p>Intelligence</p><span>${intelligence}</span></div>` : ''}
                        ${faith        ? `<div class="stats"><p>Faith</p><span>${faith}</span></div>` : ''}
                        ${arcane       ? `<div class="stats"><p>Arcane</p><span>${arcane}</span></div>` : ''}
                    </div>
                    <div class="section-right">
                        <h2>Slots</h2>
                        <div class="stats"><span>${data.slots ?? 1}</span></div>
                    </div>
                </div>
                <div class="separator-horizontal"></div>
                <div class="section-description">
                    <h2>Effect</h2>
                    <div class="stats"><p>${description}</p></div>
                </div>
            </div>`;
    }

    renderAshOfWar(asset) {
        const data        = asset.data || {};
        const description = asset.shortDescription || '';

        return `
            <div class="tooltip-body">
                <div class="data-section">
                    <div class="section-left">
                        <h2>Affinity</h2>
                        <div class="stats"><p>${data.affinity ?? '—'}</p></div>
                    </div>
                    <div class="section-right">
                        <h2>Cost</h2>
                        ${data.cost != null ? `<div class="stats"><p>FP</p><span>${data.cost}</span></div>` : ''}
                    </div>
                </div>
                <div class="separator-horizontal"></div>
                <div class="section-description">
                    <h2>Effect</h2>
                    <div class="stats"><p>${description}</p></div>
                </div>
            </div>`;
    }

    renderSpiritAsh(asset) {
        const data        = asset.data || {};
        const description = asset.shortDescription || '';
        const { fp, hp }  = data.cost || {};

        return `
            <div class="tooltip-body">
                <div class="data-section">
                    <div class="section-left">
                        <h2>Type</h2>
                        <div class="stats"><p>Spirit Summon</p></div>
                    </div>
                    <div class="section-right">
                        <h2>Cost</h2>
                        ${fp != null ? `<div class="stats"><p>FP</p><span>${fp}</span></div>` : ''}
                        ${hp != null ? `<div class="stats"><p>HP</p><span>${hp}</span></div>` : ''}
                    </div>
                </div>
                <div class="separator-horizontal"></div>
                <div class="section-description">
                    <h2>Description</h2>
                    <div class="stats"><p>${description}</p></div>
                </div>
            </div>`;
    }

    renderTalisman(asset) {
        const data   = asset.data || {};
        const weight = data.weight;
        const effect = data.effect || '';

        return `
            <div class="tooltip-body">
                <div class="section-description">
                    <h2>Effect</h2>
                    <div class="stats"><p>${effect}</p></div>
                </div>
                ${weight ? `
                <div class="section-weight">
                    <div class="stats">
                        <p>${weight}</p>
                        <span class="material-symbols-outlined">weight</span>
                    </div>
                </div>` : ''}
            </div>`;
    }
}

class TaintedGrailTooltipRenderer {

    render(asset) {
        const type = asset.type;
        if (type === 'weapon')  return this.renderWeapon(asset);
        if (type === 'armor')   return this.renderArmor(asset);
        if (type === 'magic')   return this.renderMagic(asset);
        if (type === 'jewelry') return this.renderJewelry(asset);
        if (type === 'relic')   return this.renderRelic(asset);
        return '';
    }

    renderWeapon(asset)  {
        const data= asset.data || {};
        const weight = data.weight || {};
        const gold = data.gold || {};
        const description = asset.description || 'No effect';
        const { dexterity, endurance, perception, practicality, spirituality, strength } = data.requirements;
        const damage = data.damage || {};
        const block = data.block;
        return `
            <div class="tooltip-body">
                <div class="section-horizontal">
                    <h2>Stats</h2>
                    <div class="stats"><p>(${damage.join('-')}) Damage</p></div>
                    ${block ? `<div class="stats"><p>${block} Block Power</p></div>` : ''}
                </div>
                <div class="separator-horizontal"></div>
                <div class="data-section">
                    <div class="section-left">
                        <h2>Requirements</h2>
                        ${dexterity ? `<div class="stats"><p>Dexterity</p><span>${dexterity}</span></div>` : ''}
                        ${endurance ? `<div class="stats"><p>Endurance</p><span>${endurance}</span></div>` : ''}
                        ${perception ? `<div class="stats"><p>Perception</p><span>${perception}</span></div>` : ''}
                        ${practicality ? `<div class="stats"><p>Practicality</p><span>${practicality}</span></div>` : ''}
                        ${spirituality ? `<div class="stats"><p>Spirituality</p><span>${spirituality}</span></div>` : ''}
                        ${strength ? `<div class="stats"><p>Strength</p><span>${strength}</span></div>` : ''}
                    </div>
                    <div class="section-right">
                        <h2>Cost</h2>
                        <div class="stats"><span>${data.stamina ?? 0} Stamina</span></div>
                    </div>
                </div>
                <div class="separator-horizontal"></div>
                <div class="section-horizontal">
                    <h2>Effect</h2>
                    <div class="stats"><p>${description}</p></div>
                </div>
                    ${weight != null ? `
                    <div class="section-weight">
                        <div class="stats">
                            <p>${gold}</p>
                            <span class="material-symbols-outlined">money_bag</span>
                        </div>
                        <div class="stats">
                            <p>${weight}</p>
                            <span class="material-symbols-outlined">weight</span>
                        </div>
                    </div>` : ''}
                </div>
            </div>`;
    }
    renderArmor(asset)  {
        const data= asset.data || {};
        const weight = data.weight || {};
        const armor = data.armor || {};
        const gold = data.gold || {};
        const description = asset.description || 'No effect';
        const { dexterity, endurance, perception, practicality, spirituality, strength } = data.requirements;
        return `
            <div class="tooltip-body">
                <div class="data-section">
                    <div class="section-left">
                        <h2>Requirements</h2>
                        ${dexterity ? `<div class="stats"><p>Dexterity</p><span>${dexterity}</span></div>` : ''}
                        ${endurance ? `<div class="stats"><p>Endurance</p><span>${endurance}</span></div>` : ''}
                        ${perception ? `<div class="stats"><p>Perception</p><span>${perception}</span></div>` : ''}
                        ${practicality ? `<div class="stats"><p>Practicality</p><span>${practicality}</span></div>` : ''}
                        ${spirituality ? `<div class="stats"><p>Spirituality</p><span>${spirituality}</span></div>` : ''}
                        ${strength ? `<div class="stats"><p>Strength</p><span>${strength}</span></div>` : ''}
                    </div>
                    <div class="section-right">
                        <h2>Stats</h2>
                        <div class="stats"><p>Armor</p><span>${armor}</span></div>
                    </div>
                </div>
                <div class="separator-horizontal"></div>
                <div class="section-horizontal">
                    <h2>Effect</h2>
                    <div class="stats"><p>${description}</p></div>
                </div>
                    ${weight != null ? `
                    <div class="section-weight">
                        <div class="stats">
                            <p>${gold}</p>
                            <span class="material-symbols-outlined">money_bag</span>
                        </div>
                        <div class="stats">
                            <p>${weight}</p>
                            <span class="material-symbols-outlined">weight</span>
                        </div>
                    </div>` : ''}
                </div>
            </div>`;
    }
    renderMagic(asset)  {
        const data= asset.data || {};
        const gold = data.gold || {};
        const { heavyCast, lightCast } = data.magic;
        const { dexterity, endurance, perception, practicality, spirituality, strength } = data.requirements;
        return `
            <div class="tooltip-body">
  <div>

    ${lightCast ? `
      <div style="margin-bottom: 0.5rem">
        <div style="display: flex; justify-content: space-between;">
          <h2>Light Cast</h2>
          <h3>${lightCast.type}</h3>
        </div>
        
        <div class="separator-horizontal"></div>

        <div style="display: flex; flex-direction: column; gap:2px;">
          ${lightCast.damage ? `<div class="stats"><p>${lightCast.damage.join('-')} Damage</p></div>` : ''}
          ${lightCast.healing ? `<div class="stats"><p>${lightCast.healing} Healing</p></div>` : ''}
          ${lightCast.cost ? `<div class="stats"><p>${lightCast.cost.value} ${lightCast.cost.costType}</p></div>` : ''}
          ${lightCast.effect ? `<div class="stats"><p>${lightCast.effect}</p></div>` : ''}
        </div>
      </div>
    ` : ''}

    ${heavyCast ? `
      <div style="margin-bottom: 0.5rem">
        <div style="display: flex; justify-content: space-between">
          <h2>Heavy Cast</h2>
          <h3>${heavyCast.type}</h3>
        </div>
        
        <div class="separator-horizontal"></div>

        <div style="display: flex; flex-direction: column; gap:2px;">
          ${heavyCast.damage ? `<div class="stats"><p>${heavyCast.damage.join('-')} Damage</p></div>` : ''}
          ${heavyCast.healing ? `<div class="stats"><p>${heavyCast.healing} Healing</p></div>` : ''}
          ${heavyCast.cost ? `<div class="stats"><p>${heavyCast.cost.value} ${heavyCast.cost.costType}</p></div>` : ''}
          ${heavyCast.effect ? `<div class="stats"><p>${heavyCast.effect}</p></div>` : ''}
        </div>
      </div>
    ` : ''}

    <div class="separator-horizontal"></div>

    <div class="section-horizontal">
        <h2>Requirements</h2>
        ${dexterity ? `<div class="stats"><p>Dexterity ${dexterity}</p></div>` : ''}
        ${endurance ? `<div class="stats"><p>Endurance ${endurance}</p></div>` : ''}
        ${perception ? `<div class="stats"><p>Perception ${perception}</p></div>` : ''}
        ${practicality ? `<div class="stats"><p>Practicality ${practicality}</p></div>` : ''}
        ${spirituality ? `<div class="stats"><p>Spirituality ${spirituality}</p></div>` : ''}
        ${strength ? `<div class="stats"><p>Strength ${strength}</p></div>` : ''}
    </div>

    <div class="section-weight">
      <div class="stats">
        <p>${gold}</p>
        <span class="material-symbols-outlined">money_bag</span>
      </div>
    </div>

  </div>
</div>`;
    }
    renderJewelry(asset)  {
        const data= asset.data || {};
        const weight = data.weight || 0;
        const gold = data.gold || 0;
        const description = asset.description || 'No effect';
        return `
        <div class="section-horizontal">
            <h2>Effect</h2>
            <div class="stats"><p>${description}</p></div>
        </div>
        <div class="section-weight">
            <div class="stats">
                <p>${gold}</p>
                <span class="material-symbols-outlined">money_bag</span>
            </div>
            <div class="stats">
                <p>${weight}</p>
                <span class="material-symbols-outlined">weight</span>
            </div>
        </div>
            `;
    }
    renderRelic(asset)   {
        const data= asset.data || {};
        const weight = data.weight || 0;
        const gold = data.gold || 0;
        const description = asset.description || 'No effect';
        return `
        <div class="section-horizontal">
            <h2>Effect</h2>
            <div class="stats"><p>${description}</p></div>
        </div>
        <div class="section-weight">
            <div class="stats">
                <p>${gold}</p>
                <span class="material-symbols-outlined">money_bag</span>
            </div>
            <div class="stats">
                <p>${weight}</p>
                <span class="material-symbols-outlined">weight</span>
            </div>
        </div>
            `;
    }
}