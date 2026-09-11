import 'dotenv/config'
import { db, Users, type InsertUser } from "../src/database"
import bcrypt from "bcryptjs"

async function seedUsersOnly() {
  try {
    console.log("Creating admin users...")
    
    const passwordHash = await bcrypt.hash("admin@admin.com", 10)
    
    const users: InsertUser[] = [
      {
        email: "admin@admin.com",
        nome: "Root ACTIVE",
        passwordHash,
        school: "Root",
        academicTitle: "Bacharelado",
        matricula: "123",
        role: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "steffen.lewitzka@ufba.br",
        nome: "Steffen Lewitzka",
        passwordHash,
        school: "Universidade Federal da Bahia",
        academicTitle: "Pós Doutorado, PUC-Rio, 2005",
        matricula: "123",
        role: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    for (const user of users) {
      await db.insert(Users).values(user).onConflictDoNothing()
    }
    
    console.log("✅ Admin users created successfully!")
    console.log("\nYou can login with:")
    console.log("Email: admin@admin.com")
    console.log("Password: admin@admin.com")
    
    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding users:", error)
    process.exit(1)
  }
}

seedUsersOnly()
