import type { AppType } from "../src/index";

export type * from "../src/database/schema";
export type * from "../src/modules/auth/auth.schema";

export type {
  CandidatoDoutoradoComRelacoes,
  CandidatoMestradoComRelacoes,
} from "../src/modules/candidato/candidato.service";
export type {
  UpdateCandidatoDoutoradoInput,
  UpdateCandidatoMestradoInput,
} from "../src/modules/candidato/candidato.schema";
export type {
  UpdateNotaDoutoradoInput,
  UpdateNotaMestradoInput,
} from "../src/modules/nota/nota.schema";
export type {
  UploadCandidatosDoutoradoInput,
  UploadCandidatosMestradoInput,
} from "../src/modules/importacao/importacao.schema";
export type {
  CandidatoComRelacoes,
  CandidatoResumo,
  ResponsavelCandidato,
  TipoCandidato,
  NotaMestradoUpdate,
} from "@tcc/shared";

export type { AppType };
