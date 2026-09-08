const ticketMessage = `# Ticketing System

This system is designed to allow you to create a private discussion channel with our moderation team. You should only create a ticket to discuss a moderation concern. This system is not to ask for questions about your code - use <#718214639669870683> for curriculum questions or <#1535346359711039498> for general programming questions. **Abuse of this system will result in moderation action!**

## TL;DR: This system is ONLY for moderation concerns.

### We are happy to help you in a ticket for:
- Reports of behaviour not in line with our rules.
- Questions related to our [Code of Conduct](https://freecodecamp.org/news/code-of-conduct).
- Appeals for (or questions about) a moderation action taken against you.

### Tickets should NOT be opened for:
- Help with code you've written. Use <#718214639669870683> or <#1535346359711039498>.
- Reporting a bug in a course. Use [GitHub](<https://github.com/freeCodeCamp/freeCodeCamp/issues>).
- General questions unrelated to specific moderation concerns. Use <#693145545878929499>

If your needs are aligned with the information above, click the button to open a private ticket with the moderation team~!`;

const openTicketMessage = `# Thank you for opening a ticket.

If this is a moderation emergency, e.g. a raid, please ping the moderation role.

Otherwise, please respond to this thread explaining your need for opening a ticket.`;

const closeTicketMessage = `# Ticket Closed

This ticket has been closed and locked. The member has been removed from the thread, and this thread is private so they cannot add themselves back.

Staff are welcome to discuss further here. The thread is preserved for logging.

Discord will auto-archive it, or if you are done discussing and want it out of the way you may archive it manually.`;

export { ticketMessage, openTicketMessage, closeTicketMessage };
