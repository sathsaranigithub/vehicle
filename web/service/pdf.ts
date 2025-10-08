import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import the autoTable plugin
import latterhead from '../../assets/img/latterhead.png';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}
interface row {
    discription: string
    tax: number,
    amount: number,
    total: number
}

const generatePDF = (data: any) => {
    const pdf = new jsPDF();
    const imgWidth = 210;
    const imgHeight = 75;

    const rows: row = data.rows

    pdf.addImage(latterhead, 'PNG', 0, 0, imgWidth, imgHeight);



    const leftColumnText = [
        'Project Name',
        'Company Name',
        'Proposal No',
        'Country',
    ];

    const leftColumnTextdata = [
        `: ${data.projectname}`,
        `: ${data.cname}`,
        `: ${data.ProposalNo}`,
        `: ${data.country}`,
    ];

    const rightColumnText = [
        'Invoice No',
        'Invoice Date',
        'Due Date',
        'Currency',
    ];

    const rightColumnTextdata = [
        `: ${data.invoicenumber}`,
        `: ${data.date}`,
        `: ${data.duedate}`,
        `: ${data.Currency}`,
    ];
    
    const existingPaymentDetails = [
        // Add your existing paymentDetails here
        ['Budget', '-', '-', `${data.duedate}`, `${data.totalamount}.00`],
    ];

    const existingPaymentDetailsend = [

        ['Previous Payment', '', '', '', `${data.history}.00`],
        ['Finalization', '', '', '', `${data.balance}.00`],
    ];

    // Extract values from rows and add to paymentDetails
    const newPaymentDetails = data.rows.map((rowItem: any) => [
        rowItem.discription,
        data.status||'pending',
        rowItem.tax,
        data.date1||'-',
        rowItem.amount + rowItem.tax+'.00',
    ]);

        // Add bank details to a table
        const bankDetails = [
            ["Account No.", "1000661376"],
            ['Account Holder', 'EKE.LK (PVT) LTD'],
            ['Swift Code', 'CCEYLKLX'],
            ['Bank Name', 'Commercial Bank'],
            ['Branch Name', 'Homagama'],
            ['Address', '289/9A, 5th Lane, Kulasiri Kumarage Mawatha,Katuwana,Homagama'],
    
        ];
    
    pdf.setFontSize(13);
    pdf.text('INVOICE', 87, 50, { align: 'left', lineHeightFactor: 2 });
    pdf.setFontSize(10);
    pdf.text(leftColumnText, 20, 60, { align: 'left', lineHeightFactor: 2 });
    pdf.text(leftColumnTextdata, 60, 60, { align: 'left', lineHeightFactor: 2 });

    pdf.text(rightColumnText, 100, 60, { align: 'left', lineHeightFactor: 2 });
    pdf.text(rightColumnTextdata, 140, 60, { align: 'left', lineHeightFactor: 2 });




    const paymentDetails = existingPaymentDetails.concat(newPaymentDetails);
    const finaldetails = paymentDetails.concat(existingPaymentDetailsend)

    pdf.autoTable({
        startY: 89,
        head: [['Description', 'Status', 'Taxes', 'Date', 'Amount (LKR)']],
        body: finaldetails,
        theme: 'grid', // Optional theme for the table
        styles: {

            fontSize: 10,
            cellPadding: 3,
            font: 'bold', // Make table header font bold
            fillColor: 'white', // Set background color to white
            textColor: 'black', // Set text color to black
            lineColor: 'black', // Set border color to black
            lineWidth: 0.4, // Set border width
            halign: 'center', // Horizontal alignment
            valign: 'middle', // Vertical alignme
        },
        margin: { top: 10 },
    });

    pdf.setFontSize(13);
    // pdf.text('Bank Details', 35, 150, { align: 'left', lineHeightFactor: 2 });
    pdf.setFontSize(10);
    pdf.autoTable({
        head: [['Bank Details','']],
        body: bankDetails,
        theme: 'grid', // Optional theme for the table
        styles: {
            fontSize: 10,
            cellPadding: 3,
            font: 'bold', // Make table header font bold
            fillColor: 'white', // Set background color to white
            textColor: 'black', // Set text color to black
            lineColor: 'black', // Set border color to black
            lineWidth: 0.4, // Set border width
            halign: 'center', // Horizontal alignment
            valign: 'middle', // Vertical alignme
        },
        margin: { top: 10 },
    });

    pdf.setFontSize(13);
    pdf.text('Comments or Special Instructions:', 72, 270, { align: 'left', lineHeightFactor: 2 });
    pdf.setFontSize(10);
    pdf.text('Important: Please do not forget to mention your Invoice number as the reference when you are depositing at the bank\ncounter or the deposit machine since your payment is traced via the invoice number. Further, you are requested to \nemail us a copy of the deposit slip or the screenshot of the online transfer / CEFT Transfer to finance@exe.lk on the \npayment date itself. (Please mention the Invoice Number In the Description).'
    , 15, 280, { align: 'left', lineHeightFactor: 1 });


    // Save the PDF as a blob
    const pdfBlob = pdf.output('blob');

    // Create a File object
    const pdfFile = new File([pdfBlob], 'my_document.pdf', { type: 'application/pdf' });

    return pdfFile;
};

export default generatePDF;
