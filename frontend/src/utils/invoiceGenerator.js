import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (bookingDetails, transactionId) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Primary Blue
  doc.text('EventPro Invoice', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Invoice ID: INV-${Date.now().toString().slice(-6)}`, 14, 28);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 33);
  
  // Event Details
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text('Event Details', 14, 45);
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text(`Event Name: ${bookingDetails.eventDetails?.title || 'Event'}`, 14, 52);
  doc.text(`Location: ${bookingDetails.eventDetails?.location || 'N/A'}`, 14, 58);
  doc.text(`Date: ${bookingDetails.eventDetails?.date || 'N/A'}`, 14, 64);
  
  // Attendee Details
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text('Billed To', 120, 45);
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text(`Name: ${bookingDetails.attendeeName}`, 120, 52);
  doc.text(`Email: ${bookingDetails.attendeeEmail}`, 120, 58);
  
  // Payment Details
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text('Payment Info', 14, 78);
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text(`Transaction ID: ${transactionId}`, 14, 85);
  doc.text(`Method: UPI / QR`, 14, 91);
  doc.text(`Status: PAID`, 14, 97);
  
  // Items Table
  const tableData = [
    [
      'Event Ticket', 
      bookingDetails.ticketQuantity.toString(), 
      `$${Number(bookingDetails.eventDetails?.ticketPrice || 0).toFixed(2)}`,
      `$${(Number(bookingDetails.eventDetails?.ticketPrice || 0) * bookingDetails.ticketQuantity).toFixed(2)}`
    ]
  ];
  
  autoTable(doc, {
    startY: 110,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 }
  });
  
  // Total
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text(`Total Paid: $${(Number(bookingDetails.eventDetails?.ticketPrice || 0) * bookingDetails.ticketQuantity).toFixed(2)}`, 140, finalY);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('Thank you for booking with EventPro!', 14, finalY + 30);
  
  // Save PDF
  doc.save(`Invoice_EventPro_${bookingDetails.eventId}.pdf`);
};
