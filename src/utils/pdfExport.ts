import jsPDF from 'jspdf';
import type { Question, QuestionPaper } from '../types';

export function exportToPDF(questionPaper: QuestionPaper): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Question Paper', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  doc.setFontSize(12);
  doc.text(`Topic: ${questionPaper.topic}`, margin, yPosition);
  yPosition += lineHeight;

  doc.text(`Difficulty: ${questionPaper.difficulty.toUpperCase()}`, margin, yPosition);
  yPosition += lineHeight;

  doc.text(`Date: ${new Date(questionPaper.created_at).toLocaleDateString()}`, margin, yPosition);
  yPosition += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  let totalMarks = 0;
  questionPaper.questions.forEach((q) => {
    totalMarks += q.marks;
  });

  doc.setFont('helvetica', 'bold');
  doc.text(`Total Marks: ${totalMarks}`, margin, yPosition);
  yPosition += 12;

  doc.setFont('helvetica', 'normal');

  questionPaper.questions.forEach((question: Question, index: number) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont('helvetica', 'bold');
    const questionHeader = `Q${index + 1}. [${question.marks} marks] ${question.type.toUpperCase()}`;
    doc.text(questionHeader, margin, yPosition);
    yPosition += lineHeight;

    doc.setFont('helvetica', 'normal');
    const splitQuestion = doc.splitTextToSize(question.question, pageWidth - 2 * margin);
    doc.text(splitQuestion, margin, yPosition);
    yPosition += splitQuestion.length * lineHeight;

    if (question.options && question.options.length > 0) {
      yPosition += 3;
      question.options.forEach((option, optIndex) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = margin;
        }
        const optionLabel = String.fromCharCode(65 + optIndex);
        const splitOption = doc.splitTextToSize(`${optionLabel}. ${option}`, pageWidth - 2 * margin - 5);
        doc.text(splitOption, margin + 5, yPosition);
        yPosition += splitOption.length * lineHeight;
      });
    }

    yPosition += 10;
  });

  doc.addPage();
  yPosition = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Answer Key', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  questionPaper.questions.forEach((question: Question, index: number) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`Q${index + 1}.`, margin, yPosition);
    doc.setFont('helvetica', 'normal');

    const splitAnswer = doc.splitTextToSize(question.answer, pageWidth - 2 * margin - 10);
    doc.text(splitAnswer, margin + 10, yPosition);
    yPosition += splitAnswer.length * lineHeight + 5;
  });

  const fileName = `${questionPaper.topic.replace(/\s+/g, '_')}_${questionPaper.difficulty}_${Date.now()}.pdf`;
  doc.save(fileName);
}
