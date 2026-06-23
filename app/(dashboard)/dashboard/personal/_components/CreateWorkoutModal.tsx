"use client";

import { Modal } from "@/components/ui/modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkoutModal({ isOpen, onClose }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Ficha de Treino"
      description="Estruture uma nova rotina para seus alunos."
    >
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
        <div>
          <label htmlFor="workoutName" className="block text-sm font-bold text-kore-ink mb-1.5">
            Nome do Treino
          </label>
          <input
            id="workoutName"
            type="text"
            placeholder="Ex: Push A - Peito e Tríceps"
            className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="level" className="block text-sm font-bold text-kore-ink mb-1.5">
              Nível de Dificuldade
            </label>
            <select
              id="level"
              defaultValue=""
              className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition appearance-none"
              required
            >
              <option value="" disabled>Selecione...</option>
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>

          <div>
            <label htmlFor="goal" className="block text-sm font-bold text-kore-ink mb-1.5">
              Objetivo
            </label>
            <select
              id="goal"
              defaultValue=""
              className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition appearance-none"
              required
            >
              <option value="" disabled>Selecione...</option>
              <option value="hipertrofia">Hipertrofia</option>
              <option value="forca">Força</option>
              <option value="resistencia">Resistência</option>
              <option value="mobilidade">Mobilidade</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-kore-border mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-kore-subink hover:text-kore-ink hover:bg-kore-bg transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-kore-emerald"
          >
            Avançar para seleção de exercícios
          </button>
        </div>
      </form>
    </Modal>
  );
}
