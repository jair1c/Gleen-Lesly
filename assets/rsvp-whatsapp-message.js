(function (root, factory) {
  const formatMessage = factory();
  if (typeof module === 'object' && module.exports) module.exports = formatMessage;
  else root.formatRsvpWhatsAppMessage = formatMessage;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
function whatsappMessage(invitation, attendance, attendeeCount, attendeeNames, message) {
  const individual = Number(invitation.seats) === 1 && !/^(?:familia\b|fam\.?\s)/i.test(invitation.guest_name.trim());
  const introduction = individual ? `Yo, ${invitation.guest_name}` : `Nosotros, ${invitation.guest_name}`;
  const lines = [
    '¡Hola! 🤍',
    '',
    attendance
      ? `${introduction}, ${individual ? 'confirmo' : 'confirmamos'} con mucha alegría que ${individual ? 'asistiré' : 'asistiremos'} a este día tan especial. Será un placer celebrarlo junto a ustedes. ✨`
      : `${introduction}, esta vez no ${individual ? 'podré' : 'podremos'} acompañarlos, pero ${individual ? 'deseo' : 'deseamos'} que Dios bendiga siempre su matrimonio y su nuevo hogar. ✨`
  ];
  if (attendance) {
    lines.push('', `*N.º DE ASISTENTES:* ${attendeeCount}`);
    lines.push('*NOMBRES DE LOS ASISTENTES*');
    attendeeNames.forEach(name => lines.push(`- ${name}`));
  }
  if (message) lines.push('', '*Tus palabras, para siempre*', message);
  lines.push('', attendance ? '¡Nos vemos en GlenslyLand! 🥂' : '¡Que su historia en GlenslyLand sea maravillosa!', '', '#Gleen&Les');
  return lines.join('\n');
}
  whatsappMessage.updateUrl = function (url, invitation, attendance, count, names, message) {
    const link = new URL(url);
    link.searchParams.set('text', whatsappMessage(invitation, attendance, count, names, message));
    return link.href;
  };
  return whatsappMessage;
});