# GenericRepository GetPaginatedAsync Predicate Enhancement

## Overview

The `GetPaginatedAsync` method in `GenericRepository<T>` has been enhanced with an optional predicate parameter to support filtering data before pagination. This allows for more flexible and efficient data retrieval.

## Updated Method Signatures

### For Entity Results
```csharp
Task<PaginatedList<T>> GetPaginatedAsync(
    int page, 
    int size, 
    int firstPage = 1, 
    Expression<Func<T, bool>> predicate = null, 
    Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, 
    params string[] includeProperties)
```

### For Projected Results
```csharp
Task<PaginatedList<TResult>> GetPaginatedAsync<TResult>(
    int page, 
    int size, 
    Expression<Func<T, TResult>> projection, 
    int firstPage = 1, 
    Expression<Func<T, bool>> predicate = null, 
    Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, 
    params string[] includeProperties)
```

## Parameters

- **`page`**: The page number to retrieve
- **`size`**: The number of items per page
- **`firstPage`**: The first page number (default: 1)
- **`predicate`**: *(NEW)* Optional filter expression to apply before pagination
- **`orderBy`**: Optional ordering function
- **`includeProperties`**: Navigation properties to include
- **`projection`**: *(For generic version)* Projection expression for selecting specific fields

## Usage Examples

### 1. Basic Pagination (No Changes Required)

```csharp
// Existing code continues to work - predicate defaults to null
var accounts = await _accountRepository.GetPaginatedAsync(
    page: 1, 
    size: 10, 
    firstPage: 1, 
    orderBy: q => q.OrderByDescending(x => x.Id)
);
```

### 2. Pagination with Filtering

```csharp
// Filter active accounts only
var activeAccounts = await _accountRepository.GetPaginatedAsync(
    page: 1, 
    size: 10, 
    firstPage: 1,
    predicate: account => account.IsActive == true && account.DeletedAt == null,
    orderBy: q => q.OrderByDescending(x => x.CreatedAt)
);
```

### 3. Complex Filtering Examples

```csharp
// Filter lesson plans by teacher and date range
var recentLessonPlans = await _lessonPlanRepository.GetPaginatedAsync(
    page: 1, 
    size: 20,
    predicate: lp => lp.CreatedByTeacher == teacherId && 
                     lp.CreatedAt >= DateTime.UtcNow.AddDays(-30) &&
                     lp.DeletedAt == null,
    orderBy: q => q.OrderByDescending(x => x.CreatedAt),
    includeProperties: nameof(LessonPlan.CreatedByTeacherNavigation)
);

// Filter accounts by role and email domain
var teacherAccounts = await _accountRepository.GetPaginatedAsync(
    page: 1,
    size: 50,
    predicate: acc => acc.RoleEnum == EUserRole.Teacher && 
                      acc.Email.EndsWith("@school.edu") &&
                      acc.EmailVerified == true,
    orderBy: q => q.OrderBy(x => x.FullName)
);
```

### 4. Service Layer Integration

```csharp
public async Task<BaseResponse> GetActiveAccountsAsync(int page, int size)
{
    var response = await _unitOfWork.AccountRepository.GetPaginatedAsync(
        page, 
        size, 
        firstPage: 1,
        predicate: acc => acc.IsActive == true && acc.DeletedAt == null,
        orderBy: q => q.OrderByDescending(x => x.CreatedAt)
    );
    
    return new BaseResponse
    {
        StatusCode = 200,
        Message = "SUCCESS",
        Data = response.Items.Select(e => e.ToResponse()),
        AdditionalData = response.AdditionalData
    };
}

public async Task<BaseResponse> GetLessonPlansByTeacherAsync(int teacherId, int page, int size)
{
    var response = await _unitOfWork.LessonPlanRepository.GetPaginatedAsync(
        page, 
        size,
        predicate: lp => lp.CreatedByTeacher == teacherId && lp.DeletedAt == null,
        orderBy: q => q.OrderByDescending(x => x.UpdatedAt),
        includeProperties: nameof(LessonPlan.CreatedByTeacherNavigation)
    );
    
    return new BaseResponse
    {
        StatusCode = 200,
        Message = "SUCCESS", 
        Data = response.Items.Select(e => e.ToResponse()),
        AdditionalData = response.AdditionalData
    };
}
```

### 5. Dynamic Filtering Based on Parameters

```csharp
public async Task<BaseResponse> SearchLessonPlansAsync(
    int page, 
    int size, 
    string searchTerm = null, 
    int? gradeLevel = null,
    int? teacherId = null)
{
    // Build predicate dynamically
    Expression<Func<LessonPlan, bool>> predicate = lp => lp.DeletedAt == null;
    
    if (!string.IsNullOrEmpty(searchTerm))
    {
        var searchLower = searchTerm.ToLower();
        predicate = predicate.And(lp => lp.Title.ToLower().Contains(searchLower) || 
                                       lp.Description.ToLower().Contains(searchLower));
    }
    
    if (gradeLevel.HasValue)
    {
        predicate = predicate.And(lp => lp.GradeLevel == gradeLevel.Value);
    }
    
    if (teacherId.HasValue)
    {
        predicate = predicate.And(lp => lp.CreatedByTeacher == teacherId.Value);
    }
    
    var response = await _unitOfWork.LessonPlanRepository.GetPaginatedAsync(
        page, 
        size,
        predicate: predicate,
        orderBy: q => q.OrderByDescending(x => x.CreatedAt),
        includeProperties: nameof(LessonPlan.CreatedByTeacherNavigation)
    );
    
    return new BaseResponse
    {
        StatusCode = 200,
        Message = "SUCCESS",
        Data = response.Items.Select(e => e.ToResponse()),
        AdditionalData = response.AdditionalData
    };
}
```

## Benefits

1. **Performance**: Filtering is applied at the database level, reducing data transfer
2. **Flexibility**: Supports complex filtering conditions using LINQ expressions
3. **Backward Compatibility**: Existing code continues to work without changes
4. **Type Safety**: Compile-time checking of filter expressions
5. **Database Optimization**: Filters are translated to SQL WHERE clauses

## Query Execution Order

The method applies operations in this order:
1. **Include Properties** - Eager loading of navigation properties
2. **Predicate Filter** - WHERE clause filtering
3. **Ordering** - ORDER BY clause
4. **Count** - Total count calculation (after filtering)
5. **Pagination** - SKIP and TAKE operations

## Performance Considerations

- **Indexing**: Ensure database indexes exist on columns used in predicates
- **Selective Filtering**: Apply the most selective filters first for better performance
- **Include Properties**: Only include necessary navigation properties to avoid over-fetching
- **Expression Complexity**: Keep predicate expressions reasonably simple for optimal SQL generation

## Expression Helper (Optional Enhancement)

For dynamic predicate building, consider using expression builders:

```csharp
public static class PredicateBuilder
{
    public static Expression<Func<T, bool>> And<T>(
        this Expression<Func<T, bool>> expr1,
        Expression<Func<T, bool>> expr2)
    {
        var parameter = Expression.Parameter(typeof(T));
        var body = Expression.AndAlso(
            Expression.Invoke(expr1, parameter),
            Expression.Invoke(expr2, parameter));
        return Expression.Lambda<Func<T, bool>>(body, parameter);
    }
}
```

## Migration Notes

- **No Breaking Changes**: Existing calls to `GetPaginatedAsync` will continue to work
- **Parameter Order**: The predicate parameter is positioned between `firstPage` and `orderBy`
- **Named Parameters**: Use named parameters for clarity when specifying predicates

This enhancement provides powerful filtering capabilities while maintaining full backward compatibility with existing code.