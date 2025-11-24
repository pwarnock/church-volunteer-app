# CQRS Patterns for Church Volunteer Connect

## 🎯 Command Query Responsibility Segregation (CQRS)

### **Query Side (Read Operations)**

```typescript
// src/queries/
export class OpportunityQueries {
  async findAll() {
    return await prisma.opportunity.findMany({
      include: { leader: { select: { name: true, email: true } } },
    });
  }

  async findById(id: string) {
    return await prisma.opportunity.findUnique({
      where: { id },
      include: { leader: { select: { name: true, email: true } } },
    });
  }

  async findByLeaderId(leaderId: string) {
    return await prisma.opportunity.findMany({
      where: { leaderId },
      include: { leader: { select: { name: true, email: true } } },
    });
  }

  async search(criteria: OpportunitySearchCriteria) {
    return await prisma.opportunity.findMany({
      where: {
        AND: [
          criteria.ministry && { ministry: { contains: criteria.ministry } },
          criteria.status && { status: criteria.status },
          criteria.skillsRequired && {
            requirements: {
              array_contains: criteria.skillsRequired,
            },
          },
        ],
      },
      include: { leader: { select: { name: true, email: true } } },
    });
  }
}

export type OpportunitySearchCriteria = {
  ministry?: string;
  status?: string;
  skillsRequired?: string[];
};
```

### **Command Side (Write Operations)**

```typescript
// src/commands/
export class CreateOpportunityCommand {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateOpportunityCommand): Promise<Opportunity> {
    // Validate command
    this.validate(command);

    // Create opportunity
    const opportunity = await this.prisma.opportunity.create({
      data: {
        title: command.title,
        description: command.description,
        ministry: command.ministry,
        location: command.location,
        requirements: JSON.stringify(command.requirements),
        timeCommitment: command.timeCommitment,
        status: 'ACTIVE',
        leaderId: command.leaderId,
      },
    });

    // Publish domain event
    await this.eventBus.publish(new OpportunityCreatedEvent(opportunity));

    return opportunity;
  }

  private validate(command: CreateOpportunityCommand): void {
    if (!command.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!command.leaderId) {
      throw new Error('Leader ID is required');
    }
  }
}

export class CreateOpportunityCommand {
  readonly title: string;
  readonly description: string;
  readonly ministry: string;
  readonly location: string;
  readonly requirements: string[];
  readonly timeCommitment: string;
  readonly leaderId: string;
}

export class OpportunityCreatedEvent {
  constructor(public readonly opportunity: Opportunity) {}
}

// Event Bus
export class EventBus {
  private handlers: Map<string, Function[]> = new Map();

  subscribe<T>(eventType: string, handler: (event: T) => void): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async publish<T>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.constructor.name) || [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }
}
```

### **Application Service (Command Handler)**

```typescript
// src/services/
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly opportunityQueries: OpportunityQueries,
    private readonly eventBus: EventBus
  ) {}

  async applyForOpportunity(
    command: ApplyForOpportunityCommand
  ): Promise<Application> {
    // Validate opportunity exists
    const opportunity = await this.opportunityQueries.findById(
      command.opportunityId
    );
    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    // Check if user already applied
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        opportunityId: command.opportunityId,
        volunteerId: command.volunteerId,
      },
    });

    if (existingApplication) {
      throw new Error('Already applied for this opportunity');
    }

    // Create application
    const application = await this.prisma.application.create({
      data: {
        opportunityId: command.opportunityId,
        volunteerId: command.volunteerId,
        message: command.message,
        status: 'PENDING',
      },
    });

    // Publish event
    await this.eventBus.publish(new ApplicationSubmittedEvent(application));

    return application;
  }
}

export class ApplyForOpportunityCommand {
  readonly opportunityId: string;
  readonly volunteerId: string;
  readonly message: string;
}

export class ApplicationSubmittedEvent {
  constructor(public readonly application: Application) {}
}
```

## 🎯 Benefits of CQRS

### **Scalability**: Read and write operations can be scaled independently

### **Performance**: Optimized queries for specific use cases

### **Maintainability**: Clear separation of concerns

### **Testing**: Easier to unit test commands and queries

### **Flexibility**: Multiple read models from same data

### **Event-Driven**: Loose coupling via domain events

## 📋 Implementation Guidelines

1. **Queries**: Only read operations, never modify state
2. **Commands**: Only write operations, return results
3. **Validation**: Business rules in command handlers
4. **Events**: Domain events for side effects
5. **Services**: Orchestrate complex workflows
6. **Repositories**: Data access abstraction

This provides enterprise-grade architecture while maintaining simplicity for our use case.
