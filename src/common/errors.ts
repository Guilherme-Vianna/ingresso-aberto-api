export class NotFoundError extends Error {
  override name = "NotFoundError";
}

export class ConflictError extends Error {
  override name = "ConflictError";
}

export class BusinessRuleError extends Error {
  override name = "BusinessRuleError";
}
