// Holder data and ICAO 9303 TD3 machine-readable zone for the Halqará data page.
// Visual-zone values and the MRZ are both derived from this one object.
(function (g) {
  var P = {
    type: 'P',
    code: 'HLQ',
    number: 'HQ0472918',
    surname: 'QHAPAÑA',
    given: 'ILLARË SISA',
    nationality: 'HALQARAN',
    dob: '1988-03-14',
    sex: 'F',
    birthplace: 'SALLQAPATA',
    issue: '2021-06-02',
    expiry: '2031-06-02',
    placeOfIssue: 'QORIMARKA',
    authority: 'PASAQ WASI QORIMARKA',
    personal: ''
  };
  var MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  function vizDate(iso) {
    var p = iso.split('-');
    return p[2] + ' ' + MON[+p[1] - 1] + ' ' + p[0];
  }
  function yymmdd(iso) { return iso.slice(2, 4) + iso.slice(5, 7) + iso.slice(8, 10); }
  // ICAO transliteration: strip diacritics (Ñ->N, Ë->E, Á->A), spaces -> '<'.
  function translit(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
      .replace(/[^A-Z0-9 ]/g, '').trim().replace(/ +/g, '<');
  }
  function pad(s, n) { while (s.length < n) s += '<'; return s.slice(0, n); }
  function check(s) {
    var w = [7, 3, 1], t = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i), v;
      if (c === '<') v = 0;
      else if (c >= '0' && c <= '9') v = c.charCodeAt(0) - 48;
      else v = c.charCodeAt(0) - 55; // A=10 ... Z=35
      t += v * w[i % 3];
    }
    return String(t % 10);
  }
  function mrz(p) {
    var l1 = pad('P<' + p.code + translit(p.surname) + '<<' + translit(p.given), 44);
    var doc = pad(p.number, 9), dob = yymmdd(p.dob), exp = yymmdd(p.expiry);
    var pers = pad(translit(p.personal), 14);
    var docF = doc + check(doc), dobF = dob + check(dob), expF = exp + check(exp), persF = pers + check(pers);
    var composite = check(docF + dobF + expF + persF);
    var l2 = docF + p.code + dobF + p.sex + expF + persF + composite;
    return [l1, l2];
  }
  g.PASSPORT = P;
  g.vizDate = vizDate;
  g.mrzCheck = check;
  g.mrzLines = function () { return mrz(P); };
})(typeof window !== 'undefined' ? window : globalThis);
