import { createBEM } from '../bem';

type MenuItem = {
  type: 'item';
  icon?: string;
  text?: string;
  content?: () => HTMLElement;
  children?: MenuItem[];
  classes?: string[];
  onHover?: (item: MenuItem, index: number) => void;
  onClick?: (item: MenuItem, index: number) => void;
} | {
  type: 'break';
  classes?: string[];
};

const arrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>`;
export const createMenu = (data: MenuItem[]) => {
  const bem = createBEM('qsf', 'menu');

  const wrapper = document.createElement('div');
  wrapper.classList.add(bem.b());

  for (const [index, item] of data.entries()) {
    const { type, classes = [] } = item;
    const itemWrapper = document.createElement('div');
    itemWrapper.classList.add(bem.be('item-container'), ...classes);

    if (type === 'break') {
      itemWrapper.classList.add(bem.is('break'));
    }
    else if (type === 'item') {
      const { icon, text, content, children = [], onHover, onClick } = item;
      if (!icon && !text && !content) continue;
      if (content) {
        itemWrapper.appendChild(content());
      }
      else {
        if (icon) {
          const iconEl = document.createElement('span');
          iconEl.classList.add(bem.be('icon'));
          iconEl.innerHTML = icon;
          itemWrapper.appendChild(iconEl);
        }
        if (text) {
          const textEl = document.createElement('span');
          textEl.textContent = text;
          itemWrapper.appendChild(textEl);
        }
      }
      if (children.length > 0) {
        const arrowEl = document.createElement('span');
        arrowEl.classList.add(bem.be('icon'), bem.is('arrow'));
        arrowEl.innerHTML = arrow;
        itemWrapper.appendChild(arrowEl);

        const subMenu = createMenu(children);
        subMenu.classList.add(bem.is('transparent'));
        let timer: ReturnType<typeof setTimeout> | undefined;
        const removeSubMenu = () => {
          subMenu.remove();
        };
        for (const el of [itemWrapper, subMenu]) {
          el.addEventListener('mouseenter', () => {
            if (timer) {
              clearTimeout(timer);
              timer = undefined;
            }
            itemWrapper.classList.add(bem.is('active'));
            subMenu.removeEventListener('transitionend', removeSubMenu);
            const rect = itemWrapper.getBoundingClientRect();
            Object.assign(subMenu.style, {
              position: 'fixed',
              width: `${rect.width}px`,
              top: `${rect.top}px`,
              left: `${rect.right}px`,
            });
            if (!document.body.contains(subMenu)) {
              document.body.appendChild(subMenu);
            }
            requestAnimationFrame(() => {
              subMenu.classList.remove(bem.is('transparent'));
              const subRect = subMenu.getBoundingClientRect();
              if (subRect.right > window.innerWidth) {
                Object.assign(subMenu.style, {
                  left: `${rect.left - subRect.width}px`,
                });
              }
              if (subRect.bottom > window.innerHeight) {
                Object.assign(subMenu.style, {
                  top: `${rect.bottom - subRect.height}px`,
                });
              }
            });
          });
          el.addEventListener('mouseleave', () => {
            if (timer) {
              clearTimeout(timer);
              timer = undefined;
            }
            itemWrapper.classList.remove(bem.is('active'));
            timer = setTimeout(() => {
              subMenu.addEventListener('transitionend', removeSubMenu, { once: true });
              subMenu.classList.add(bem.is('transparent'));
            }, 150);
          });
        }
      }

      if (onHover) {
        itemWrapper.addEventListener('mouseenter', () => onHover(item, index));
      }
      if (onClick) {
        itemWrapper.addEventListener('click', () => onClick(item, index));
      }
    }
    else {
      continue;
    }

    wrapper.appendChild(itemWrapper);
  }
  return wrapper;
};