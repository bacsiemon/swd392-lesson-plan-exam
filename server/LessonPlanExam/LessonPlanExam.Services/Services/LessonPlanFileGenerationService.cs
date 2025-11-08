using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Services.Interfaces;

namespace LessonPlanExam.Services.Services
{
    /// <summary>
    /// Service for generating documents from lesson plans and slot plans
    /// </summary>
    public class LessonPlanFileGenerationService : ILessonPlanFileGenerationService
    {
        /// <summary>
        /// Generates a Word document (.docx) for a lesson plan with its slot plans
        /// </summary>
        /// <param name="lessonPlan">The lesson plan entity with slot plans included</param>
        /// <returns>Byte array containing the Word document</returns>
        public async Task<byte[]> GenerateWordDocumentAsync(LessonPlan lessonPlan)
        {
            if (lessonPlan == null)
            {
                throw new ArgumentNullException(nameof(lessonPlan));
            }

            using var memoryStream = new MemoryStream();
            
            // Create a new Word document
            using (var wordDocument = WordprocessingDocument.Create(memoryStream, WordprocessingDocumentType.Document))
            {
                // Add main document part
                var mainDocumentPart = wordDocument.AddMainDocumentPart();
                mainDocumentPart.Document = new Document();
                var body = mainDocumentPart.Document.AppendChild(new Body());

                // Add document title
                AddTitle(body, lessonPlan.Title ?? "Giáo án chưa có tiêu đề");

                // Add lesson plan details section
                AddLessonPlanDetails(body, lessonPlan);

                // Add slot plans section if available
                if (lessonPlan.SlotPlans?.Any() == true)
                {
                    AddSlotPlansSection(body, lessonPlan.SlotPlans.OrderBy(sp => sp.SlotNumber));
                }
                else
                {
                    AddParagraph(body, "Không có tiết học nào cho Giáo án này.", true);
                }

                // Add footer
                AddFooter(body, lessonPlan);
            }

            return await Task.FromResult(memoryStream.ToArray());
        }

        /// <summary>
        /// Adds the main title to the document
        /// </summary>
        private static void AddTitle(Body body, string title)
        {
            var titleParagraph = new Paragraph();
            var titleRun = new Run();
            var titleRunProperties = new RunProperties();
            
            titleRunProperties.AppendChild(new Bold());
            titleRunProperties.AppendChild(new FontSize { Val = "28" });
            titleRunProperties.AppendChild(new Color { Val = "2E75B6" });
            
            titleRun.AppendChild(titleRunProperties);
            titleRun.AppendChild(new Text(title));
            titleParagraph.AppendChild(titleRun);
            
            // Center align the title
            var titleParagraphProperties = new ParagraphProperties();
            titleParagraphProperties.AppendChild(new Justification { Val = JustificationValues.Center });
            titleParagraph.AppendChild(titleParagraphProperties);
            
            body.AppendChild(titleParagraph);
            
            // Add spacing after title
            AddEmptyParagraph(body);
        }

        /// <summary>
        /// Adds lesson plan details section
        /// </summary>
        private static void AddLessonPlanDetails(Body body, LessonPlan lessonPlan)
        {
            // Section header
            AddSectionHeader(body, "Chi tiết Giáo án");

            // Create a table for lesson plan details
            var table = new Table();
            
            // Table properties
            var tableProperties = new TableProperties();
            tableProperties.AppendChild(new TableWidth { Type = TableWidthUnitValues.Pct, Width = "5000" });
            tableProperties.AppendChild(new TableBorders(
                new TopBorder { Val = BorderValues.Single, Size = 6 },
                new BottomBorder { Val = BorderValues.Single, Size = 6 },
                new LeftBorder { Val = BorderValues.Single, Size = 6 },
                new RightBorder { Val = BorderValues.Single, Size = 6 },
                new InsideHorizontalBorder { Val = BorderValues.Single, Size = 6 },
                new InsideVerticalBorder { Val = BorderValues.Single, Size = 6 }
            ));
            table.AppendChild(tableProperties);

            // Add rows with lesson plan information
            AddTableRow(table, "Lớp", lessonPlan.GradeLevel.ToString());
            AddTableRow(table, "Được tạo bởi", lessonPlan.CreatedByTeacherNavigation?.Account?.FullName ?? "Không xác định");
            AddTableRow(table, "Trường", lessonPlan.CreatedByTeacherNavigation?.SchoolName ?? "Không xác định");
            AddTableRow(table, "Ngày tạo", lessonPlan.CreatedAt?.ToString("dd/MM/yyyy") ?? "Không xác định");
            AddTableRow(table, "Cập nhật lần cuối", lessonPlan.UpdatedAt?.ToString("dd/MM/yyyy") ?? "Không xác định");

            body.AppendChild(table);
            AddEmptyParagraph(body);

            // Objectives section
            if (!string.IsNullOrWhiteSpace(lessonPlan.Objectives))
            {
                AddSubsectionHeader(body, "Mục tiêu");
                AddParagraph(body, lessonPlan.Objectives);
                AddEmptyParagraph(body);
            }

            // Description section
            if (!string.IsNullOrWhiteSpace(lessonPlan.Description))
            {
                AddSubsectionHeader(body, "Mô tả");
                AddParagraph(body, lessonPlan.Description);
                AddEmptyParagraph(body);
            }
        }

        /// <summary>
        /// Adds slot plans section
        /// </summary>
        private static void AddSlotPlansSection(Body body, IEnumerable<SlotPlan> slotPlans)
        {
            AddSectionHeader(body, "Danh sách tiết học");
            
            foreach (var slotPlan in slotPlans)
            {
                // Slot header with number and title
                var slotHeader = $"Tiết {slotPlan.SlotNumber}: {slotPlan.Title ?? "Untitled Activity"}";
                AddSubsectionHeader(body, slotHeader);

                // Duration if specified
                if (slotPlan.DurationMinutes.HasValue)
                {
                    var durationText = $"Thời gian: {slotPlan.DurationMinutes.Value} phút";
                    AddParagraph(body, durationText, true);
                }

                // Objectives
                if (!string.IsNullOrWhiteSpace(slotPlan.Objectives))
                {
                    AddParagraph(body, "Mục tiêu:", true);
                    AddParagraph(body, slotPlan.Objectives);
                }

                // Equipment needed
                if (!string.IsNullOrWhiteSpace(slotPlan.EquipmentNeeded))
                {
                    AddParagraph(body, "Thiết bị cần thiết:", true);
                    AddParagraph(body, slotPlan.EquipmentNeeded);
                }

                // Preparations
                if (!string.IsNullOrWhiteSpace(slotPlan.Preparations))
                {
                    AddParagraph(body, "Chuẩn bị:", true);
                    AddParagraph(body, slotPlan.Preparations);
                }

                // Activities
                if (!string.IsNullOrWhiteSpace(slotPlan.Activities))
                {
                    AddParagraph(body, "Hoạt động:", true);
                    AddParagraph(body, slotPlan.Activities);
                }

                // Revise questions
                if (!string.IsNullOrWhiteSpace(slotPlan.ReviseQuestions))
                {
                    AddParagraph(body, "Câu hỏi ôn tập:", true);
                    AddParagraph(body, slotPlan.ReviseQuestions);
                }

                // If no content is available
                if (string.IsNullOrWhiteSpace(slotPlan.Objectives) && 
                    string.IsNullOrWhiteSpace(slotPlan.EquipmentNeeded) &&
                    string.IsNullOrWhiteSpace(slotPlan.Preparations) &&
                    string.IsNullOrWhiteSpace(slotPlan.Activities) &&
                    string.IsNullOrWhiteSpace(slotPlan.ReviseQuestions))
                {
                    AddParagraph(body, "Không có nội dung.", true);
                }

                AddEmptyParagraph(body);
            }
        }

        /// <summary>
        /// Adds a section header (large, bold text)
        /// </summary>
        private static void AddSectionHeader(Body body, string text)
        {
            var paragraph = new Paragraph();
            var run = new Run();
            var runProperties = new RunProperties();
            
            runProperties.AppendChild(new Bold());
            runProperties.AppendChild(new FontSize { Val = "20" });
            runProperties.AppendChild(new Color { Val = "1F4E79" });
            
            run.AppendChild(runProperties);
            run.AppendChild(new Text(text));
            paragraph.AppendChild(run);
            
            body.AppendChild(paragraph);
            AddEmptyParagraph(body);
        }

        /// <summary>
        /// Adds a subsection header (medium, bold text)
        /// </summary>
        private static void AddSubsectionHeader(Body body, string text)
        {
            var paragraph = new Paragraph();
            var run = new Run();
            var runProperties = new RunProperties();
            
            runProperties.AppendChild(new Bold());
            runProperties.AppendChild(new FontSize { Val = "16" });
            runProperties.AppendChild(new Color { Val = "2E75B6" });
            
            run.AppendChild(runProperties);
            run.AppendChild(new Text(text));
            paragraph.AppendChild(run);
            
            body.AppendChild(paragraph);
        }

        /// <summary>
        /// Adds a regular paragraph
        /// </summary>
        private static void AddParagraph(Body body, string text, bool isItalic = false)
        {
            var paragraph = new Paragraph();
            var run = new Run();
            
            if (isItalic)
            {
                var runProperties = new RunProperties();
                runProperties.AppendChild(new Italic());
                run.AppendChild(runProperties);
            }
            
            run.AppendChild(new Text(text));
            paragraph.AppendChild(run);
            body.AppendChild(paragraph);
        }

        /// <summary>
        /// Adds an empty paragraph for spacing
        /// </summary>
        private static void AddEmptyParagraph(Body body)
        {
            body.AppendChild(new Paragraph());
        }

        /// <summary>
        /// Adds a table row with label and value
        /// </summary>
        private static void AddTableRow(Table table, string label, string value)
        {
            var row = new TableRow();
            
            // Label cell (bold)
            var labelCell = new TableCell();
            var labelCellProperties = new TableCellProperties();
            labelCellProperties.AppendChild(new TableCellWidth { Type = TableWidthUnitValues.Pct, Width = "2000" });
            labelCell.AppendChild(labelCellProperties);
            
            var labelParagraph = new Paragraph();
            var labelRun = new Run();
            var labelRunProperties = new RunProperties();
            labelRunProperties.AppendChild(new Bold());
            labelRun.AppendChild(labelRunProperties);
            labelRun.AppendChild(new Text(label));
            labelParagraph.AppendChild(labelRun);
            labelCell.AppendChild(labelParagraph);
            
            // Value cell
            var valueCell = new TableCell();
            var valueCellProperties = new TableCellProperties();
            valueCellProperties.AppendChild(new TableCellWidth { Type = TableWidthUnitValues.Pct, Width = "3000" });
            valueCell.AppendChild(valueCellProperties);
            
            var valueParagraph = new Paragraph();
            var valueRun = new Run();
            valueRun.AppendChild(new Text(value ?? "Không xác định"));
            valueParagraph.AppendChild(valueRun);
            valueCell.AppendChild(valueParagraph);
            
            row.AppendChild(labelCell);
            row.AppendChild(valueCell);
            table.AppendChild(row);
        }

        /// <summary>
        /// Adds footer information
        /// </summary>
        private static void AddFooter(Body body, LessonPlan lessonPlan)
        {
            AddEmptyParagraph(body);
            AddEmptyParagraph(body);
            
            // Add a separator line
            var separatorParagraph = new Paragraph();
            var separatorRun = new Run();
            separatorRun.AppendChild(new Text("________________________________________________"));
            separatorParagraph.AppendChild(separatorRun);
            
            var separatorParagraphProperties = new ParagraphProperties();
            separatorParagraphProperties.AppendChild(new Justification { Val = JustificationValues.Center });
            separatorParagraph.AppendChild(separatorParagraphProperties);
            
            body.AppendChild(separatorParagraph);
            
            // Footer text
            var footerText = $"Được tạo vào ngày {DateTime.Now:dd/MM/yyyy 'lúc' HH:mm}";
            var footerParagraph = new Paragraph();
            var footerRun = new Run();
            var footerRunProperties = new RunProperties();
            footerRunProperties.AppendChild(new FontSize { Val = "18" });
            footerRunProperties.AppendChild(new Color { Val = "808080" });
            footerRunProperties.AppendChild(new Italic());
            
            footerRun.AppendChild(footerRunProperties);
            footerRun.AppendChild(new Text(footerText));
            footerParagraph.AppendChild(footerRun);
            
            var footerParagraphProperties = new ParagraphProperties();
            footerParagraphProperties.AppendChild(new Justification { Val = JustificationValues.Center });
            footerParagraph.AppendChild(footerParagraphProperties);
            
            body.AppendChild(footerParagraph);
        }
    }
}