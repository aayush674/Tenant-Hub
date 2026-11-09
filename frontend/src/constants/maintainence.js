export const MODE = { CREATE: "create", VIEW: "view", EDIT: "edit" };

export const REQUEST_STATUS_LABELS = {
  pending: "Pending",
  assigned: "Assigned",
  resolved: "Resolved",
};

export const REQUEST_CATEGORY_LABELS = {
  room_furniture: "Room Furniture",
  electricity: "Electricity",
  plumbing: "Plumbing",
  internet: "Internet",
  other: "Other Issue",
};

export const REQUEST_ACTIONS_BY_STATUS = {
  admin: {
    pending: ["edit", "assign"],
    assigned: ["edit", "edit_assignment", "resolve"],
    resolved: ["view"],
  },
  tenant: { pending: ["edit"], assigned: ["view"], resolved: ["view"] },
};
