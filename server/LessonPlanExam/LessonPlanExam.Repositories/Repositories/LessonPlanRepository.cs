using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Repositories.Base;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace LessonPlanExam.Repositories.Repositories
{
    public class LessonPlanRepository : GenericRepository<LessonPlan>, ILessonPlanRepository
    {
        public LessonPlanRepository(LessonPlanExamDbContext context) : base(context)
        {
        }

        public async Task<PaginatedList<LessonPlan>> SearchAsync(Expression<Func<LessonPlan, bool>> predicate, int page = 1, int size = 10)
        {
            // Get the base query with includes for navigation properties
            var query = _context.LessonPlans
                .AsNoTracking()
                .Include(lp => lp.CreatedByTeacherNavigation)
                    .ThenInclude(t => t.Account)
                .Where(predicate);
            
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();
            
            return new PaginatedList<LessonPlan>
            {
                Page = page,
                Size = size,
                Total = totalCount,
                Items = items,
                TotalPages = (int)Math.Ceiling(totalCount / (double)size)
            };
        }
    }
}