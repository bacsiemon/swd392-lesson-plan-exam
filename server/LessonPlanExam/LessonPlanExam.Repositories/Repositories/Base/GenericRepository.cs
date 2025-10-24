using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.Interfaces.Base;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace LessonPlanExam.Repositories.Repositories.Base
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected LessonPlanExamDbContext _context;

        public GenericRepository(LessonPlanExamDbContext context)
        {
            _context = context;
        }

        public List<T> GetAll()
        {
            return _context.Set<T>().ToList();
        }
        
        public async Task<List<T>> GetAllAsync()
        {
            return await _context.Set<T>().ToListAsync();
        }
        
        public async Task<List<T>> GetAllAsync(params string[] includeProperties)
        {
            IQueryable<T> query = _context.Set<T>();

            // Eagerly load the related entities specified in includeProperties
            foreach (var includeProperty in includeProperties)
            {
                query = query.Include(includeProperty);
            }

            return await query.ToListAsync();
        }

        /// <summary>
        /// Get all entities async with strongly typed include properties
        /// </summary>
        public async Task<List<T>> GetAllAsync(params Expression<Func<T, object>>[] includeProperties)
        {
            IQueryable<T> query = _context.Set<T>();

            // Eagerly load the related entities specified in includeProperties
            foreach (var includeProperty in includeProperties)
            {
                query = query.Include(includeProperty);
            }

            return await query.ToListAsync();
        }

        public async Task<PaginatedList<T>> GetPaginatedAsync(int page, int size, int firstPage = 1, Expression<Func<T, bool>> predicate = null, Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, params string[] includeProperties)
        {
            if (firstPage > page)
                throw new ArgumentException($"Page ({page}) must be greater or equal than firstPage ({firstPage})");

            IQueryable<T> query = _context.Set<T>();

            // Eagerly load the related entities specified in includeProperties
            if (includeProperties != null && includeProperties.Length > 0)
            {
                foreach (var includeProperty in includeProperties)
                {
                    query = query.Include(includeProperty);
                }
            }

            // Apply predicate filtering if provided
            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            // Apply ordering if provided
            if (orderBy != null)
            {
                query = orderBy(query);
            }

            var total = await query.CountAsync();
            var items = await query.Skip((page - firstPage) * size).Take(size).ToListAsync();
            var totalPages = (int)Math.Ceiling(total / (double)size);

            return new PaginatedList<T>
            {
                Page = page,
                Size = size,
                Total = total,
                Items = items,
                TotalPages = totalPages
            };
        }

        /// <summary>
        /// Get paginated results with strongly typed include properties
        /// </summary>
        public async Task<PaginatedList<T>> GetPaginatedAsync(int page, int size, int firstPage = 1, Expression<Func<T, bool>> predicate = null, Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, params Expression<Func<T, object>>[] includeProperties)
        {
            if (firstPage > page)
                throw new ArgumentException($"Page ({page}) must be greater or equal than firstPage ({firstPage})");

            IQueryable<T> query = _context.Set<T>();

            // Eagerly load the related entities specified in includeProperties
            if (includeProperties != null && includeProperties.Length > 0)
            {
                foreach (var includeProperty in includeProperties)
                {
                    query = query.Include(includeProperty);
                }
            }

            // Apply predicate filtering if provided
            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            // Apply ordering if provided
            if (orderBy != null)
            {
                query = orderBy(query);
            }

            var total = await query.CountAsync();
            var items = await query.Skip((page - firstPage) * size).Take(size).ToListAsync();
            var totalPages = (int)Math.Ceiling(total / (double)size);

            return new PaginatedList<T>
            {
                Page = page,
                Size = size,
                Total = total,
                Items = items,
                TotalPages = totalPages
            };
        }

        public async Task<PaginatedList<TResult>> GetPaginatedAsync<TResult>(int page, int size, Expression<Func<T, TResult>> projection, int firstPage = 1, Expression<Func<T, bool>> predicate = null, Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, params string[] includeProperties)
        {
            if (firstPage > page)
                throw new ArgumentException($"Page ({page}) must be greater or equal than firstPage ({firstPage})");

            IQueryable<T> query = _context.Set<T>();

            // Eagerly load the related entities specified in includeProperties
            if (includeProperties != null && includeProperties.Length > 0)
            {
                foreach (var includeProperty in includeProperties)
                {
                    query = query.Include(includeProperty);
                }
            }

            // Apply predicate filtering if provided
            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            // Apply ordering if provided (before projection for correct sorting)
            if (orderBy != null)
            {
                query = orderBy(query);
            }

            // Get total count before projection
            var total = await query.CountAsync();
            
            // Apply projection and pagination
            var items = await query.Skip((page - firstPage) * size)
                                 .Take(size)
                                 .Select(projection)
                                 .ToListAsync();
            
            var totalPages = (int)Math.Ceiling(total / (double)size);

            return new PaginatedList<TResult>
            {
                Page = page,
                Size = size,
                Total = total,
                Items = items,
                TotalPages = totalPages
            };
        }

        /// <summary>
        /// Get paginated projected results with strongly typed include properties
        /// </summary>
        public async Task<PaginatedList<TResult>> GetPaginatedAsync<TResult>(int page, int size, Expression<Func<T, TResult>> projection, int firstPage = 1, Expression<Func<T, bool>> predicate = null, Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, params Expression<Func<T, object>>[] includeProperties)
        {
            if (firstPage > page)
                throw new ArgumentException($"Page ({page}) must be greater or equal than firstPage ({firstPage})");

            IQueryable<T> query = _context.Set<T>();

            // Eagerly load the related entities specified in includeProperties
            if (includeProperties != null && includeProperties.Length > 0)
            {
                foreach (var includeProperty in includeProperties)
                {
                    query = query.Include(includeProperty);
                }
            }

            // Apply predicate filtering if provided
            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            // Apply ordering if provided (before projection for correct sorting)
            if (orderBy != null)
            {
                query = orderBy(query);
            }

            // Get total count before projection
            var total = await query.CountAsync();
            
            // Apply projection and pagination
            var items = await query.Skip((page - firstPage) * size)
                                 .Take(size)
                                 .Select(projection)
                                 .ToListAsync();
            
            var totalPages = (int)Math.Ceiling(total / (double)size);

            return new PaginatedList<TResult>
            {
                Page = page,
                Size = size,
                Total = total,
                Items = items,
                TotalPages = totalPages
            };
        }

        public void Create(T entity)
        {
            _context.Add(entity);
        }

        public void CreateRange(List<T> entities)
        {
            _context.AddRange(entities);
        }

        public void Update(T entity)
        {
            var tracker = _context.Attach(entity);
            tracker.State = EntityState.Modified;
        }

        public void UpdateRange(List<T> entities)
        {
            foreach (var entity in entities)
            {
                var tracker = _context.Attach(entity);
                tracker.State = EntityState.Modified;
            }
        }

        public bool Remove(T entity)
        {
            _context.Remove(entity);
            return true;
        }

        public void RemoveRange(List<T> entities)
        {
            _context.RemoveRange(entities);
        }

        public T GetById(int id)
        {
            return _context.Set<T>().Find(id);
        }

        public async Task<T> GetByIdAsync(int id)
        {
            return await _context.Set<T>().FindAsync(id);
        }
        
        public async Task<T> GetByIdAsync(int id, params string[] includes)
        {
            IQueryable<T> query = _context.Set<T>();

            // Dynamically include related entities if provided
            if (includes != null)
            {
                foreach (var include in includes)
                {
                    query = query.Include(include);
                }
            }

            return await query.FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id);
        }

        /// <summary>
        /// Get entity by ID async with strongly typed include properties
        /// </summary>
        public async Task<T> GetByIdAsync(int id, params Expression<Func<T, object>>[] includeProperties)
        {
            IQueryable<T> query = _context.Set<T>();

            // Dynamically include related entities if provided
            if (includeProperties != null)
            {
                foreach (var includeProperty in includeProperties)
                {
                    query = query.Include(includeProperty);
                }
            }

            return await query.FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id);
        }

        public T GetById(string code)
        {
            return _context.Set<T>().Find(code);
        }

        public async Task<T> GetByIdAsync(string code)
        {
            return await _context.Set<T>().FindAsync(code);
        }

        public T GetById(Guid code)
        {
            return _context.Set<T>().Find(code);
        }

        public async Task<T> GetByIdAsync(Guid code)
        {
            return await _context.Set<T>().FindAsync(code);
        }
    }
}