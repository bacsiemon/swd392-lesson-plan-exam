using App.Infrastructure.BaseClasses;
using System;
using System.Linq;
using System.Linq.Expressions;

namespace LessonPlanExam.Repositories.Interfaces.Base
{
    public interface IGenericRepository<T> where T : class
    {
        void Create(T entity);
        void CreateRange(List<T> entities);
        List<T> GetAll();
        Task<List<T>> GetAllAsync();
        Task<List<T>> GetAllAsync(params string[] includeProperties);
        
        /// <summary>
        /// Get all entities async with strongly typed include properties
        /// </summary>
        /// <param name="includeProperties">Strongly typed navigation property expressions</param>
        /// <returns>List of entities with included navigation properties</returns>
        Task<List<T>> GetAllAsync(params Expression<Func<T, object>>[] includeProperties);
        
        T GetById(Guid code);
        T GetById(int id);
        T GetById(string code);
        Task<T> GetByIdAsync(Guid code);
        Task<T> GetByIdAsync(int id);
        Task<T> GetByIdAsync(int id, params string[] includes);
        
        /// <summary>
        /// Get entity by ID async with strongly typed include properties
        /// </summary>
        /// <param name="id">Entity ID</param>
        /// <param name="includeProperties">Strongly typed navigation property expressions</param>
        /// <returns>Entity with included navigation properties</returns>
        Task<T> GetByIdAsync(int id, params Expression<Func<T, object>>[] includeProperties);
        
        Task<T> GetByIdAsync(string code);
        
        /// <summary>
        /// Get paginated results with string-based includes (legacy support)
        /// </summary>
        Task<PaginatedList<T>> GetPaginatedAsync(
            int page, 
            int size, 
            int firstPage = 1, 
            Expression<Func<T, bool>>? predicate = null, 
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, 
            params string[] includeProperties);
            
        /// <summary>
        /// Get paginated results with strongly typed include properties
        /// </summary>
        /// <param name="page">Page number</param>
        /// <param name="size">Page size</param>
        /// <param name="firstPage">First page number (default: 1)</param>
        /// <param name="predicate">Optional filter predicate</param>
        /// <param name="orderBy">Optional ordering function</param>
        /// <param name="includeProperties">Strongly typed navigation property expressions</param>
        /// <returns>Paginated list with included navigation properties</returns>
        Task<PaginatedList<T>> GetPaginatedAsync(
            int page, 
            int size, 
            int firstPage = 1, 
            Expression<Func<T, bool>>? predicate = null, 
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, 
            params Expression<Func<T, object>>[] includeProperties);
            
        /// <summary>
        /// Get paginated projected results with string-based includes (legacy support)
        /// </summary>
        Task<PaginatedList<TResult>> GetPaginatedAsync<TResult>(
            int page, 
            int size, 
            Expression<Func<T, TResult>> projection,
            int firstPage = 1, 
            Expression<Func<T, bool>>? predicate = null, 
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, 
            params string[] includeProperties);        /// <summary>
        /// Get paginated projected results with strongly typed include properties
        /// </summary>
        /// <param name="page">Page number</param>
        /// <param name="size">Page size</param>
        /// <param name="projection">Projection expression for result transformation</param>
        /// <param name="firstPage">First page number (default: 1)</param>
        /// <param name="predicate">Optional filter predicate</param>
        /// <param name="orderBy">Optional ordering function</param>
        /// <param name="includeProperties">Strongly typed navigation property expressions</param>
        /// <returns>Paginated list of projected results with included navigation properties</returns>
        Task<PaginatedList<TResult>> GetPaginatedAsync<TResult>(
            int page, 
            int size, 
            Expression<Func<T, TResult>> projection,
            int firstPage = 1, 
            Expression<Func<T, bool>>? predicate = null, 
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, 
            params Expression<Func<T, object>>[] includeProperties);        bool Remove(T entity);
        void RemoveRange(List<T> entities);
        void Update(T entity);
        void UpdateRange(List<T> entities);
    }
}