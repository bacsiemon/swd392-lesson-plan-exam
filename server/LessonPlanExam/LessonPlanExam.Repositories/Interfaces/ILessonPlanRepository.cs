using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.Interfaces.Base;
using LessonPlanExam.Repositories.Models;
using System.Linq.Expressions;

namespace LessonPlanExam.Repositories.Interfaces
{
    public interface ILessonPlanRepository : IGenericRepository<LessonPlan>
    {
        Task<PaginatedList<LessonPlan>> SearchAsync(Expression<Func<LessonPlan, bool>> predicate, int page = 1, int size = 10);
    }
}