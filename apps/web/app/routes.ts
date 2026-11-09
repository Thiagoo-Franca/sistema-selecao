import { index, layout, route, type RouteConfig } from "@react-router/dev/routes"

export default [
  index("features/auth/pages/loginPage.tsx"),
  route("reset-password/:token", "features/auth/pages/reset-password.$token.tsx"),

  // Layout for authenticated routes
  layout("shared/components/layout/appLayout.tsx", [
    route("dashboard", "features/dashboard/pages/dashboard.tsx"),
    route("mestrado/:id", "features/candidates/mestrado/pages/mestrado.$id.tsx"),
    route("doutorado/:id", "features/candidates/doutorado/pages/doutorado.$id.tsx"),
    route("profile", "features/profile/pages/profile.tsx"),
    route("admin", "features/users/pages/admin.tsx"),
    route("admin/users", "features/users/pages/admin.users.tsx"),
    route("admin/users/:id", "features/users/pages/admin.users.$id.tsx"),
    route("feedback", "features/feedback/pages/feedback.tsx"),
  ]),
] satisfies RouteConfig
