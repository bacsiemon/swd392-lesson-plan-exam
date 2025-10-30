using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Repositories.Base;

namespace LessonPlanExam.Repositories.Repositories
{
    public class LessonPlanFileRepository : GenericRepository<LessonPlanFile>, ILessonPlanFileRepository
    {
        public LessonPlanFileRepository(LessonPlanExamDbContext context) : base(context)
        {
        }
    }
}