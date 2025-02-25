import { type RouteConfig, index, route } from "@react-router/dev/routes"
export default [
  index("routes/Home.tsx"),
  route("/addbanca", "routes/ExaminingBoard/index.jsx"),
  route("/login", "routes/Login/index.jsx"),
  route("/register", "routes/Register/index.jsx"),
  route("/account", "routes/AccountSettings/index.jsx"),
  route("/dashboard", "routes/Dashboard/index.jsx"),
  route("/verbanca", "routes/ViewBanca/index.jsx"),
  route("/addition", "routes/Addition/index.jsx"),
  route("/settings", "routes/Settings/index.jsx"),
  route("/users", "routes/Users/index.jsx"),
  route("/editarbanca/:id", "routes/ViewBoard/index.jsx"),
  route("/resetpass", "routes/ResetPassword/index.jsx"),
  route("/experimento", "routes/Evaluation/Evaluation.jsx"),
] satisfies RouteConfig
