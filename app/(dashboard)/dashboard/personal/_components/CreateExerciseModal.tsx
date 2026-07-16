"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { createExercise } from "@/app/actions/library-actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateExerciseModal({ isOpen, onClose }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await createExercise(formData);
        const { toast } = require("@/store/useToastStore");
        toast.success("Exercício cadastrado com sucesso!");
        onClose();
      } catch (error) {
        const { toast } = require("@/store/useToastStore");
        toast.error("Erro ao cadastrar exercício.");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Exercício"
      description="Adicione um novo movimento ao seu catálogo."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-kore-ink mb-1.5">
            Nome do Exercício
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Ex: Supino Reto com Halteres"
            className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="muscle" className="block text-sm font-bold text-kore-ink mb-1.5">
              Grupo Muscular Alvo
            </label>
            <select
              id="muscle"
              name="muscle"
              defaultValue=""
              className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition appearance-none"
              required
            >
              <option value="" disabled>Selecione...</option>
              <option value="peito">Peito</option>
              <option value="costas">Costas</option>
              <option value="pernas">Pernas</option>
              <option value="ombros">Ombros</option>
              <option value="biceps">Bíceps</option>
              <option value="triceps">Tríceps</option>
              <option value="core">Core</option>
            </select>
          </div>

          <div>
            <label htmlFor="equipment" className="block text-sm font-bold text-kore-ink mb-1.5">
              Equipamento
            </label>
            <select
              id="equipment"
              name="equipment"
              defaultValue=""
              className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition appearance-none"
              required
            >
              <option value="" disabled>Selecione...</option>
              <option value="halteres">Halteres</option>
              <option value="barra">Barra</option>
              <option value="polia">Polia</option>
              <option value="maquina">Máquina</option>
              <option value="peso-corporal">Peso Corporal</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="videoUrl" className="block text-sm font-bold text-kore-ink mb-1.5">
            Link de Vídeo Demonstrativo
          </label>
          <input
            id="videoUrl"
            name="videoUrl"
            type="url"
            placeholder="Ex: https://youtube.com/..."
            className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-kore-border mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-kore-subink hover:text-kore-ink hover:bg-kore-bg transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-kore-emerald disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Salvando..." : "Salvar Exercício"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
