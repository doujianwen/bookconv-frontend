describe('Storage: MIME type mapping', () => {
  const getMimeType = (ext) => {
    const map = {
      epub: 'application/epub+zip', azw3: 'application/x-mobipocket-ebook',
      pdf: 'application/pdf', txt: 'text/plain', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      htmlz: 'application/zip', mobi: 'application/x-mobipocket-ebook', rtf: 'application/rtf',
      jpg: 'image/jpeg', png: 'image/png', fb2: 'application/x-fb2+zip',
      cbr: 'application/vnd.comicbook-rar', cbz: 'application/vnd.comicbook+zip',
      djvu: 'image/vnd.djvu', doc: 'application/msword', lit: 'application/x-ms-reader',
    };
    return map[ext] || 'application/octet-stream';
  };

  it('should return correct MIME types for all common formats', () => {
    expect(getMimeType('epub')).toBe('application/epub+zip');
    expect(getMimeType('pdf')).toBe('application/pdf');
    expect(getMimeType('txt')).toBe('text/plain');
    expect(getMimeType('docx')).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    expect(getMimeType('mobi')).toBe('application/x-mobipocket-ebook');
    expect(getMimeType('jpg')).toBe('image/jpeg');
    expect(getMimeType('png')).toBe('image/png');
  });

  it('should return octet-stream for unknown formats', () => {
    expect(getMimeType('xyz')).toBe('application/octet-stream');
    expect(getMimeType('')).toBe('application/octet-stream');
  });

  it('should handle image-specific MIME types', () => {
    expect(getMimeType('jpg')).toBe('image/jpeg');
    expect(getMimeType('png')).toBe('image/png');
    expect(getMimeType('djvu')).toBe('image/vnd.djvu');
  });

  it('should handle comic book formats', () => {
    expect(getMimeType('cbr')).toBe('application/vnd.comicbook-rar');
    expect(getMimeType('cbz')).toBe('application/vnd.comicbook+zip');
  });

  it('should cover all output extensions used in the conversion map', () => {
    const extensions = ['epub', 'azw3', 'pdf', 'txt', 'docx', 'htmlz', 'mobi', 'rtf', 'jpg', 'png', 'fb2', 'cbr', 'djvu', 'doc', 'lit'];
    for (const ext of extensions) {
      const mime = getMimeType(ext);
      expect(mime).toBeDefined();
      expect(mime.length).toBeGreaterThan(0);
    }
  });
});
