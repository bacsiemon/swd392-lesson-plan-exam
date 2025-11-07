# Document Generation Service

The `DocumentGenerationService` provides functionality to generate Word documents (.docx) from LessonPlan entities with their associated SlotPlans.

## Features

- Generates professionally formatted Word documents
- Includes lesson plan details (title, objectives, description, grade level, etc.)
- Includes teacher information and school name
- Lists all slot plans (activities) ordered by slot number
- Includes duration and content for each activity
- Professional formatting with headers, tables, and styled text
- Automatic footer with generation timestamp

## Usage

### Service Registration

The service is automatically registered in the dependency injection container via `ServiceConfigurations.cs`:

```csharp
services.AddScoped<IDocumentGenerationService, DocumentGenerationService>();
```

### API Endpoint

Generate and download a Word document for a lesson plan:

```
GET /api/lessonplan/{id}/generate-word-document
```

**Requirements:**
- User must be authenticated with a valid JWT token
- User must have `Teacher` role
- User must be the owner of the lesson plan

**Response:**
- Success (200): Returns the Word document as a downloadable file
- Error responses: 400, 401, 403, 404, 500 with appropriate error messages

### Service Methods

#### `GenerateWordDocumentAsync(LessonPlan lessonPlan)`

Generates a Word document from a LessonPlan entity.

**Parameters:**
- `lessonPlan`: The LessonPlan entity with SlotPlans and Teacher information included

**Returns:**
- `Task<byte[]>`: Byte array containing the Word document

**Requirements:**
- LessonPlan must include navigation properties:
  - `SlotPlans` (collection of slot plans)
  - `CreatedByTeacherNavigation` (teacher entity)
  - `CreatedByTeacherNavigation.Account` (teacher account information)

### Example Usage in Code

```csharp
// Inject the service
private readonly IDocumentGenerationService _documentService;

// Get lesson plan with required navigation properties
var lessonPlan = await _unitOfWork.LessonPlanRepository.GetByIdAsync(
    id,
    lp => lp.SlotPlans,
    lp => lp.CreatedByTeacherNavigation,
    lp => lp.CreatedByTeacherNavigation.Account
);

// Generate the Word document
var documentBytes = await _documentService.GenerateWordDocumentAsync(lessonPlan);

// Return as downloadable file
return File(
    documentBytes,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    $"LessonPlan_{id}_{DateTime.Now:yyyyMMdd_HHmmss}.docx"
);
```

## Document Structure

The generated Word document includes:

1. **Title Section**
   - Lesson plan title (centered, large, colored)
   
2. **Lesson Plan Details Table**
   - Grade Level
   - Created By (teacher name)
   - School
   - Created Date
   - Last Updated

3. **Objectives Section** (if available)
   - Learning objectives and outcomes

4. **Description Section** (if available)
   - Detailed lesson description

5. **Lesson Activities Section**
   - Each slot plan as a separate subsection
   - Activity number and title
   - Duration (if specified)
   - Activity content

6. **Footer**
   - Generation timestamp

## Dependencies

- **DocumentFormat.OpenXml**: Used for creating Word documents
- **Microsoft.EntityFrameworkCore**: For data access and navigation properties

## Error Handling

The service includes comprehensive error handling:

- Null parameter validation
- Graceful handling of missing navigation properties
- Professional document formatting even with minimal data
- Exception propagation for proper API error responses

## Security

- Only teachers can generate documents
- Users can only generate documents for their own lesson plans
- JWT token validation required
- Proper authorization checks in the controller layer