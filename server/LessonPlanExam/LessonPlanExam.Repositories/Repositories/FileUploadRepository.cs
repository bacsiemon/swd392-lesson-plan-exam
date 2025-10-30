using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Repositories.Base;

namespace LessonPlanExam.Repositories.Repositories
{
    public class FileUploadRepository : GenericRepository<FileUpload>, IFileUploadRepository
    {
        public FileUploadRepository(LessonPlanExamDbContext context) : base(context)
        {
        }
    }
}