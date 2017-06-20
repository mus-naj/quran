function exportDataToCsv(data){
    var csv = ConvertToCSV(data);
    var fileName = "table";
    if (navigator.userAgent.search("MSIE") >= 0) {
        //This peice of code is not working in IE, we will working on this
        saveCsvFile(data,fileName);
    } else {
        var uri = 'data:text/csv;charset=utf-8,' + escape(csv);
        var downloadLink = document.createElement("a");
        downloadLink.href = uri;
        downloadLink.download = fileName + ".csv";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

}

function write_to_excel() {

    str = "";

    var mytable = document.getElementsByTagName("table")[0];
    var rowCount = mytable.rows.length;
    var colCount = mytable.getElementsByTagName("tr")[0].getElementsByTagName("td").length;

    var ExcelApp = new ActiveXObject("Excel.Application");
    var ExcelSheet = new ActiveXObject("Excel.Sheet");
    ExcelSheet.Application.Visible = true;

    for (var i = 0; i < rowCount; i++) {
        for (var j = 0; j < colCount; j++) {
            str = mytable.getElementsByTagName("tr")[i].getElementsByTagName("td")[j].innerHTML;
            ExcelSheet.ActiveSheet.Cells(i + 1, j + 1).Value = str;
        }
    }
}

function saveCsvFile(data, fileName){
    if(typeof(fileName) == "undefined"){
        fileName = "table";
    }
    var IEwindow = window.open();
    IEwindow.document.write('sep=,\r\n' + data);
    IEwindow.document.close();
    IEwindow.document.execCommand('SaveAs', true, fileName + ".csv");
    IEwindow.close();
}

function ConvertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

    var str = '';
    var line = '';

    var head = array[0];

    for (var index in array[0]) {
        var value = index + "";
        line += '"' + value.replace(/"/g, '""') + '",';
    }

    line = line.slice(0, -1);
    str += line + '\r\n';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            var value = array[i][index] + "";
            line += '"' + value.replace(/"/g, '""') + '",';
        }

        line = line.slice(0, -1);
        str += line + '\r\n';
    }
    return str;
};
