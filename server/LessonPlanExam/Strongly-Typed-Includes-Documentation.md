# Strongly Typed Include Properties Enhancement

## Overview

The `IGenericRepository<T>` interface and `GenericRepository<T>` implementation have been enhanced with strongly typed include properties using `Expression<Func<T, object>>[]` parameters. This provides IntelliSense support, compile-time type checking, and better refactoring support compared to string-based navigation property includes.

## Enhanced Method Signatures

### GetAllAsync Methods
```csharp
// Legacy string-based approach
Task<List<T>> GetAllAsync(params string[] includeProperties);

// New strongly typed approach  
Task<List<T>> GetAllAsync(params Expression<Func<T, object>>[] includeProperties);
```

### GetByIdAsync Methods
```csharp
// Legacy string-based approach
Task<T> GetByIdAsync(int id, params string[] includes);

// New strongly typed approach
Task<T> GetByIdAsync(int id, params Expression<Func<T, object>>[] includeProperties);
```

### GetPaginatedAsync Methods
```csharp
// Legacy string-based approach
Task<PaginatedList<T>> GetPaginatedAsync(
    int page, 
    int size, 
    int firstPage = 1, 
    Expression<Func<T, bool>> predicate = null, 
    Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, 
    params string[] includeProperties);

// New strongly typed approach
Task<PaginatedList<T>> GetPaginatedAsync(
    int page, 
    int size, 
    int firstPage = 1, 
    Expression<Func<T, bool>> predicate = null, 
    Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, 
    params Expression<Func<T, object>>[] includeProperties);
```

### Projected GetPaginatedAsync Methods
```csharp
// Legacy string-based approach
Task<PaginatedList<TResult>> GetPaginatedAsync<TResult>(
    int page, 
    int size, 
    Expression<Func<T, TResult>> projection, 
    int firstPage = 1, 
    Expression<Func<T, bool>> predicate = null, 
    Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, 
    params string[] includeProperties);

// New strongly typed approach
Task<PaginatedList<TResult>> GetPaginatedAsync<TResult>(
    int page, 
    int size, 
    Expression<Func<T, TResult>> projection, 
    int firstPage = 1, 
    Expression<Func<T, bool>> predicate = null, 
    Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, 
    params Expression<Func<T, object>>[] includeProperties);
```

## Usage Examples

### 1. Basic Strongly Typed Includes

```csharp
// Single navigation property
var lessonPlans = await repository.GetAllAsync(lp => lp.CreatedByTeacherNavigation);

// Multiple navigation properties
var lessonPlans = await repository.GetAllAsync(
    lp => lp.CreatedByTeacherNavigation,
    lp => lp.SlotPlans
);
```

### 2. GetByIdAsync with Strongly Typed Includes

```csharp
// Single include
var lessonPlan = await repository.GetByIdAsync(
    id, 
    new Expression<Func<LessonPlan, object>>[] { lp => lp.CreatedByTeacherNavigation }
);

// Multiple includes - explicit array syntax to avoid ambiguity
var lessonPlan = await repository.GetByIdAsync(
    id, 
    new Expression<Func<LessonPlan, object>>[] 
    { 
        lp => lp.CreatedByTeacherNavigation,
        lp => lp.SlotPlans 
    }
);
```

### 3. Paginated Results with Strongly Typed Includes

```csharp
// Single include with filtering
var response = await repository.GetPaginatedAsync(
    page: 1, 
    size: 20,
    predicate: lp => lp.DeletedAt == null,
    orderBy: q => q.OrderByDescending(x => x.CreatedAt),
    includeProperties: new Expression<Func<LessonPlan, object>>[] { lp => lp.CreatedByTeacherNavigation }
);

// Multiple includes
var response = await repository.GetPaginatedAsync(
    page: 1, 
    size: 20,
    predicate: lp => lp.DeletedAt == null && lp.GradeLevel >= 10,
    orderBy: q => q.OrderByDescending(x => x.CreatedAt),
    includeProperties: new Expression<Func<LessonPlan, object>>[]
    {
        lp => lp.CreatedByTeacherNavigation,
        lp => lp.SlotPlans
    }
);
```

### 4. Avoiding Method Ambiguity

When the compiler cannot determine which overload to use, be explicit:

```csharp
// Use explicit array syntax to avoid ambiguity
var response = await repository.GetPaginatedAsync(
    1, 10,
    predicate: (Expression<Func<LessonPlan, bool>>)null,
    orderBy: q => q.OrderBy(x => x.Title),
    includeProperties: new Expression<Func<LessonPlan, object>>[0] // Empty array
);

// Or use string-based approach when no includes are needed
var response = await repository.GetPaginatedAsync(
    1, 10,
    predicate: (Expression<Func<LessonPlan, bool>>)null,
    orderBy: q => q.OrderBy(x => x.Title),
    includeProperties: new string[0] // Empty string array
);
```

### 5. Service Layer Integration

```csharp
public class LessonPlanService : ILessonPlanService
{
    public async Task<BaseResponse> GetLessonPlansWithTeacherInfoAsync(int page, int size)
    {
        var response = await _unitOfWork.LessonPlanRepository.GetPaginatedAsync(
            page, 
            size,
            predicate: lp => lp.DeletedAt == null,
            orderBy: q => q.OrderByDescending(x => x.CreatedAt),
            includeProperties: new Expression<Func<LessonPlan, object>>[] 
            { 
                lp => lp.CreatedByTeacherNavigation 
            }
        );

        return new BaseResponse
        {
            StatusCode = 200,
            Message = "SUCCESS",
            Data = response.Items.Select(e => e.ToResponse()),
            AdditionalData = response.AdditionalData
        };
    }

    public async Task<BaseResponse> GetDetailedLessonPlanAsync(int id)
    {
        var lessonPlan = await _unitOfWork.LessonPlanRepository.GetByIdAsync(
            id,
            new Expression<Func<LessonPlan, object>>[]
            {
                lp => lp.CreatedByTeacherNavigation,
                lp => lp.SlotPlans
            }
        );

        if (lessonPlan == null || lessonPlan.DeletedAt != null)
        {
            return new BaseResponse
            {
                StatusCode = 404,
                Message = "LESSON_PLAN_NOT_FOUND"
            };
        }

        return new BaseResponse
        {
            StatusCode = 200,
            Message = "SUCCESS",
            Data = lessonPlan.ToResponse()
        };
    }
}
```

## Benefits of Strongly Typed Includes

### 1. **Compile-Time Type Safety**
```csharp
// ? Compile-time checked
lp => lp.CreatedByTeacherNavigation

// ? Runtime error if typo in string
"CreatedByTeacherNavigaton" // Typo - runtime error
```

### 2. **IntelliSense Support**
- Auto-completion shows available navigation properties
- Prevents typos and incorrect property names
- Shows property types and documentation

### 3. **Refactoring Support**
- Automatic updates when navigation properties are renamed
- Find all references works correctly
- Safe renaming across the codebase

### 4. **Better Debugging**
- Stack traces show actual property names
- Easier to identify which include caused issues
- Clear error messages for invalid expressions

## Navigation Properties Available

### LessonPlan Entity
```csharp
// Single navigation properties
lp => lp.CreatedByTeacherNavigation  // Teacher entity

// Collection navigation properties  
lp => lp.SlotPlans                   // Collection of SlotPlan entities
```

### Account Entity
```csharp
// Single navigation properties
acc => acc.Admin      // Admin entity (if account is admin)
acc => acc.Student    // Student entity (if account is student)  
acc => acc.Teacher    // Teacher entity (if account is teacher)
```

### Teacher Entity
```csharp
// Single navigation property
t => t.Account        // Associated Account entity

// Collection navigation properties
t => t.LessonPlans    // Collection of LessonPlan entities
t => t.Exams          // Collection of Exam entities
t => t.QuestionBanks  // Collection of QuestionBank entities
t => t.ExamMatrices   // Collection of ExamMatrix entities
```

## Backward Compatibility

Both string-based and strongly typed approaches are supported:

```csharp
// Legacy approach still works
var lessonPlans1 = await repository.GetAllAsync("CreatedByTeacherNavigation");

// New strongly typed approach
var lessonPlans2 = await repository.GetAllAsync(lp => lp.CreatedByTeacherNavigation);
```

## Performance Considerations

- **No Performance Difference**: Both approaches generate identical SQL queries
- **Eager Loading**: All includes are applied as Entity Framework `Include()` calls
- **Query Optimization**: Includes are applied before filtering and ordering for optimal performance

## Migration Guide

### From String-Based to Strongly Typed

```csharp
// Before
await repository.GetPaginatedAsync(
    1, 10,
    orderBy: q => q.OrderBy(x => x.Title),
    includeProperties: nameof(LessonPlan.CreatedByTeacherNavigation)
);

// After  
await repository.GetPaginatedAsync(
    1, 10,
    orderBy: q => q.OrderBy(x => x.Title),
    includeProperties: new Expression<Func<LessonPlan, object>>[] 
    { 
        lp => lp.CreatedByTeacherNavigation 
    }
);
```

### Multiple Includes Migration

```csharp
// Before
await repository.GetAllAsync(
    nameof(LessonPlan.CreatedByTeacherNavigation),
    nameof(LessonPlan.SlotPlans)
);

// After
await repository.GetAllAsync(
    lp => lp.CreatedByTeacherNavigation,
    lp => lp.SlotPlans
);
```

This enhancement provides a modern, type-safe approach to including navigation properties while maintaining full backward compatibility with existing string-based includes.