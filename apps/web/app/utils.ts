export const TODO = <const T>(_: T & { __brand: "TODO" }) => {}

// Fake use history just for let me replace the react-router-dom
export const useHistory = () => {
  TODO("Remove useHistory")
  return {
    push: (path: string) => {
      window.location.href = path
    },
  }
}
