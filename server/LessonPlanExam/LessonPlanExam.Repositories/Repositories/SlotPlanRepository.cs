using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Repositories.Base;

namespace LessonPlanExam.Repositories.Repositories
{
    public class SlotPlanRepository : GenericRepository<SlotPlan>, ISlotPlanRepository
    {
        public SlotPlanRepository(LessonPlanExamDbContext context) : base(context)
        {
        }
    }
}