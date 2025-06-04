/**
 * 展示头像上的名字 如 陈志成，展示为 志成，取最后两个字符
 * @param {string} name
 * @returns
 */
export function goodlookName(name) {
  if (name === undefined || name === null) {
    return '';
  }
  return name.length > 1 ? name.substring(name.length - 1, name.length) : name;
};

/**
 * 根据 id 获取颜色
 */
export function getColorById(id) {
  if (!id) {
    return 'transparent';
  }
  if (id % 5 === 0) {
    return 'rgba(87, 169, 251, 1)';
  } if (id % 5 === 1) {
    return '#f89898';
  } else if (id % 5 === 2) {
    return 'rgba(181, 226, 65, 1)';

  } else if (id % 5 === 3) {
    return 'rgba(141, 78, 218, 1)';
  } else if (id % 5 === 4) {
    return 'rgba(249, 204, 69, 1)';
  }
}
