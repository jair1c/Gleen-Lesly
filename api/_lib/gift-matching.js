const catalog = require('../../assets/gift-catalog.json');

function normalize(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').split(' ')
    .filter(word => word && !['de','del','la','las','el','los','un','una','unos','unas','para','por','con','y','en','al'].includes(word))
    .map(word => word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word).join(' ');
}

// El nombre más específico gana: «plancha a vapor» no es la plancha común.
function matchingIds(description) {
  const text = ' ' + normalize(description) + ' ';
  const matches = catalog.flatMap(item => [item.name, ...(item.aliases || [])].map(alias => ({ id: item.id, name: normalize(alias) })))
    .filter(item => item.name && text.includes(' ' + item.name + ' '));
  return [...new Set(matches.filter(item => !matches.some(other => other.name.length > item.name.length && (' ' + other.name + ' ').includes(' ' + item.name + ' '))).map(item => item.id))];
}

module.exports = { matchingIds, normalize };
