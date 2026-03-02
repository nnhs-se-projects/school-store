module.exports = { exportXLSX, createSheet };
const fs = require("fs");

// used with permission, see: https://github.com/JKSquires/xlsx-web-experiment

/* Creates ZIP file data as blob from inputted file data.
Parameters:
- files (Object[]): array of Objects that have the following properties:
  - name (string): file name and path in ZIP file
  - data (ArrayBuffer): file binary data
Return: (Blob)
  ZIP file data as a blob */
function createZIP(files) {
  /* Calculates CRC-32 for inputted data.
  Parameters:
  - data (Uint8Array): data to use for CRC
  Return: (32-bit unsigned integer)
    CRC-32 value */
  function calcCRC32(data) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
      let c = data[i];
      for (let j = 0; j < 8; j++) {
        let b = (c ^ crc) & 1;
        crc >>>= 1;
        if (b) {
          crc = crc ^ 0xEDB88320;
        }
        c >>>= 1;
      }
    }

    return ~crc >>> 0;
  }

  /* Writes a value over 4 consecutive bytes to a Uint8Array at a specified index.
  Parameters:
  - arr (Uint8Array): Array to write to
  - start_i (integer): Start index for writing to in the array
  - value (integer): Value to be written
  Preconditions:
  - The array referenced by `arr` must be indexed in the range [`start_i`, `start_i + 3`]
  Side-Effects:
  - Updates the Uint8Array referenced by `arr`
  Return: (undefined) */
  function write4B(arr, start_i, value) {
    arr[start_i] = value & 0xFF;
    arr[start_i + 1] = (value & 0xFF00) >> 8;
    arr[start_i + 2] = (value & 0xFF0000) >> 16;
    arr[start_i + 3] = (value & 0xFF000000) >>> 24;
  }

  /* Writes a value over 2 consecutive bytes to a Uint8Array at a specified index.
  Parameters:
  - arr (Uint8Array): Array to write to
  - start_i (integer): Start index for writing to in the array
  - value (integer): Value to be written
  Preconditions:
  - The array referenced by `arr` must be indexed in the range [`start_i`, `start_i + 1`]
  Side-Effects:
  - Updates the Uint8Array referenced by `arr`
  Return: (undefined) */
  function write2B(arr, start_i, value) {
    arr[start_i] = value & 0xFF;
    arr[start_i + 1] = (value & 0xFF00) >> 8;
  }

  const files_complete = files.map((file) => ({
    name: file.name,
    data: file.data,
    crc: calcCRC32(new Uint8Array(file.data)),
    local_header_offset: null
  }));

  const zip_data = [];

  let offset_count = 0;
  let central_dir_offset;

  // local files
  for (const file of files_complete) {
    const header = new ArrayBuffer(30);
    const rw_header = new Uint8Array(header);

    // local file header signature
    write4B(rw_header, 0, 0x04034B50);
    // file name length
    write2B(rw_header, 26, file.name.length);
    // version needed to extract
    rw_header[4] = 10; // 1.0
    // crc-32
    write4B(rw_header, 14, file.crc);
    // compressed size
    write4B(rw_header, 18, file.data.byteLength);
    // uncompressed size
    write4B(rw_header, 22, file.data.byteLength);

    file.local_header_offset = offset_count;
    zip_data.push(header);
    offset_count += header.byteLength;
    zip_data.push(file.name);
    offset_count += file.name.length;
    zip_data.push(file.data);
    offset_count += file.data.byteLength;
  }

  central_dir_offset = offset_count;

  // central directory
  for (const file of files_complete) {
    const header = new ArrayBuffer(46);
    const rw_header = new Uint8Array(header);

    // central file header signature
    write4B(rw_header, 0, 0x02014B50)
    // version made by
    rw_header[4] = 63; // 6.3.x; I used 6.3.10
    rw_header[5] = 3; // UNIX
    // file name length
    write2B(rw_header, 28, file.name.length);
    // relative offset of local header
    write4B(rw_header, 42, file.local_header_offset);
    // version needed to extract
    rw_header[6] = 10; // 1.0
    // crc-32
    write4B(rw_header, 16, file.crc);
    // compressed size
    write4B(rw_header, 20, file.data.byteLength);
    // uncompressed size
    write4B(rw_header, 24, file.data.byteLength);
    // external file attributes
    write2B(rw_header, 40, 0o00100644); // UNIX file permissions: -rw-r--r--

    zip_data.push(header);
    offset_count += header.byteLength;
    zip_data.push(file.name);
    offset_count += file.name.length;
  }

  // end of central directory record
  {
    const end_record = new ArrayBuffer(22);
    const rw_end_record = new Uint8Array(end_record);

    // end of central directory signature
    write4B(rw_end_record, 0, 0x06054B50);
    // total number of entries in the central directory on this disk
    write2B(rw_end_record, 8, files_complete.length);
    // total number of entries in the central directory
    write2B(rw_end_record, 10, files_complete.length);
    // size of the central directory
    write4B(rw_end_record, 12, offset_count - central_dir_offset);
    // offset of the start of the central directory with respect to the starting disk number
    write4B(rw_end_record, 16, central_dir_offset);

    zip_data.push(end_record);
  }

  return new Blob(zip_data);
}

/* Creates an Object that contains sheet data and name.
Parameters:
- name (string): Worksheet name
- sheet_data (string): Worksheet data
Return: (Object)
  Object with the following properties:
  - name (string): Worksheet name
  - sheet_data (string): Worksheet data */
function createSheet(name, sheet_data) {
  return {
    name,
    sheet_data
  };
}

/* Maintainability note:
The `worksheet` parameters of the objects in `sheets' are a strings containing sheet data (sections of the full XML file for worksheet data in the XLSX ZIP file system).
Here is a rudimentary breakdown of sheet data in XLSX files:
- The data in the cells are stored in a <sheetData> element
  - Every row is stored in <row> elements
    - <row> tags take an `r` attribute that stores the row number (one-based indexing)
    - Every cell in a row is stored in <c> elements
      - <c> tags take an `r` attribute that stores the cell name (e.g. "A1")
      - <c> tags can also take a `t` attribute that defines the type of data stored in that <c> element
        - For numerical values, `t` does not have to be set (t="n" by default)
          - Numerical values require <v> elements
            - The numerical value can then be stored in the <v> element
        - For string values, `t` should be set to "inlineStr" (technically, this is using inline strings, as opposed to shared strings, which this function does not support)
          - These inline strings require an <is> element ("inline string")
            - Inside the <is> element, there should be a <t> element ("text")
              - Strings can then be stored in the <t> element
        - <c> tags' `t` attribute can also be set to other values, like following:
          - "b" for boolean
          - "e" for error
          - "d" for date/time (although, typically "n" is used instead)
          - "s" for shared string (strings are stored in a separate file)
          - "str" for string (legacy)
- Cell merge data is stored in a <mergeCells> element (this is only used if there are merged cells)
  - <mergeCells> tags take a `count` attribute that stores the number of merges (i.e. the number of <mergeCell> elements inside the <mergeCells> element)
  - The individual merges are stored in <mergeCell />
    - <mergeCell /> tags take a `ref` attribute that stores which cells get merged (e.g. "A1:C1" for merging from cell A1 to cell C1)
- Column formatting is stored in a <cols> element (only needed if you need to change from default)
  - If defined, <cols> MUST be defined before <sheetData> elements
  - Individual groups of columns are formatted in <col /> tags
    - <col /> tags take a `min` and a `max` attribute which specifies the starting and ending columns respectively that the formatting applies to (one-based indexing)
    - <col /> tags can take a `width` attribute that specifies the width of the cells in characters
      - If `width` is not specified, it uses the default width for the program reading the spreadsheet
    - <col /> tags can take a `customWidth` attribute, which is a flag for if the specified width should be used
      - `customWidth` can be set to "0" (false) or "1" (true)
      - If `customWidth` is not specified, it defaults to "0"
In short, sheet data is stored in rows and cells, merging cells is handled in <mergeCells>, and column formatting is handled in <cols>.
Example:
```
<cols>
  <col min="1" max="2" width="20" customWidth="1"/>
</cols>
<sheetData>
  <row r="1">
    <c r="A1" t="inlineStr">
      <is><t>example text</t></is>
    </c>
  </row>
  <row r="2">
    <c r="A2">
      <v>1234</v>
    </c>
    <c r="C2">
      <v>321</v>
    </c>
  </row>
</sheetData>
<mergeCells count="1">
  <mergeCell ref="A1:C1"/>
</mergeCells>
``` */
/* Creates a data URL for downloading an XLSX spreadsheet from given sheet data.
Parameters:
- sheets (Object[]): Object with the following parameters:
  - name (string): Worksheet name
  - worksheet (string): Worksheet data
Globals Used:
- fs (Object): Node File System module
Return: (string)
  Data URL for XLSX spreadsheet */
async function exportXLSX(sheets) {
  const encoder = new TextEncoder();

  /* Creates an Object that contains text file name and data.
  Parameters:
  - n (string): File name
  - t (string): File text
  Return: (Object)
    Object with the following properties:
    - name (string): file name and path in ZIP file
    - data (ArrayBuffer): file binary data */
  function createTextFile(n, t) {
    return {
      name: n,
      data: encoder.encode(t).buffer
    };
  }

  let rels = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
  let content_types = '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>';
  let workbook_rels = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  let workbook = '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>';

  for (let i = 1; i <= sheets.length; i++) {
    content_types += '<Override PartName="/xl/worksheets/sheet' + i + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
    workbook += '<sheet name="' + sheets[i - 1].name + '" sheetId="' + i + '" r:id="rId' + i + '"/>'
    workbook_rels += '<Relationship Id="rId' + i + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + i + '.xml"/>';
  }

  content_types += '</Types>';
  workbook += '</sheets></workbook>';
  workbook_rels += '</Relationships>';

  const files_to_zip = [
    createTextFile("_rels/.rels", rels),
    createTextFile("[Content_Types].xml", content_types),
    createTextFile("xl/workbook.xml", workbook),
    createTextFile("xl/_rels/workbook.xml.rels", workbook_rels)
  ];
  
  for (let i = 1; i <= sheets.length; i++) {
    files_to_zip.push(createTextFile("xl/worksheets/sheet" + i + ".xml",
      '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' + sheets[i - 1].sheet_data + '</worksheet>'));
  }

  const xlsx_blob = createZIP(files_to_zip);
  const xlsx_buffer = await xlsx_blob.arrayBuffer();
  return "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + Buffer.from(xlsx_buffer).toString("base64");
}