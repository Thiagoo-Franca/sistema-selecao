export function formatDate(dateString: string | null | undefined | Date): string {
  if (!dateString) {
    return "Não informado"
  }
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatBoolean(valor: boolean) {
  if (valor) {
    return "Sim"
  }
  return "Não"
}

export function formatCPF(cpf: string) {
  if (!cpf) {
    return "Não informado"
  }
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export function formatPhoneNumber(phoneNumber: string | null | undefined) {
  if (!phoneNumber) {
    return "Não informado"
  }

  // (71) 98899-2000 ou (71) 9999-2000
  const cleaned = phoneNumber.replace(/\D/g, "")
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }
}

export function handleCopy(text: string, id: string) {
  navigator.clipboard.writeText(text).then(() => {
    setCopiedId(id)
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    })
    setTimeout(() => setCopiedId(null), 2000)
  })
}
