export default function resetform(form: HTMLFormElement): void {
  const inputs = form.querySelectorAll("input")
  const textareas = form.querySelectorAll("textarea")

  inputs.forEach(input => (input.value = ""))
  textareas.forEach(textarea => (textarea.value = ""))
}
