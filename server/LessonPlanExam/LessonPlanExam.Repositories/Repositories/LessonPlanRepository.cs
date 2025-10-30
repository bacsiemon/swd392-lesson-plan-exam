using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace LessonPlanExam.Repositories.Repositories
{
    public class LessonPlanRepository : GenericRepository<LessonPlan>, ILessonPlanRepository
    {
        public LessonPlanRepository(LessonPlanExamDbContext context) : base(context)
        {
        }
    }
}