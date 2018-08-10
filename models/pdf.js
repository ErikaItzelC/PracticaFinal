var pdf= require('pdfkit');
var fs=require('fs');

var myDoc = new pdf;

myDoc.pipe(fs.createWriteStream('citas.pdf'));


myDoc.image('imagen/consultorio.jpg', 0, 15,width=300)
     .text('Consultorio Best Health', 150, 150)
myDoc.font('Times-Roman')
     .fontSize(24)
     .text('Atencion de calidad porque usted la merece',100,100);
     myDoc.end();
