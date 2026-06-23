"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Trash2 } from "lucide-react";
import { editExercise, deleteExercise } from "@/app/actions/library-actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exercise: {
    id: string;
    name: string;
    muscle_group: string | null;
    category: string | null;
    image_url: string | null;
    description: string | null;
  };
}

export function EditExerciseModal({ isOpen, onClose, exercise }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await editExercise(exercise.id, formData);
        alert("Exercício atualizado com sucesso!");
        onClose();
      } catch (error) {
        alert("Erro ao atualizar exercício.");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Tem certeza que deseja excluir este exercício?")) return;
    
    setIsDeleting(true);
    startTransition(async () => {
      try {
        await deleteExercise(exercise.id);
        alert("Exercício excluído!");
        onClose();
      } catch (error) {
        alert("Erro ao excluir exercício.");
      } finally {
        setIsDeleting(false);
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Exercício"
      description="Atualize as informações do exercício selecionado."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor={`edit-name-${exercise.id}`} className="block text-sm font-bold text-kore-ink mb-1.5">
            Nome do Exercício
          </label>
          <input
            id={`edit-name-${exercise.id}`}
            name="name"
            type="text"
            defaultValue={exercise.name}
            className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`edit-muscle-${exercise.id}`} className="block text-sm font-bold text-kore-ink mb-1.5">
              Grupo Muscular Alvo
            </label>
            <select
              id={`edit-muscle-${exercise.id}`}
              name="muscle"
              defaultValue={exercise.muscle_group?.toLowerCase() || ""}
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
            <label htmlFor={`edit-equipment-${exercise.id}`} className="block text-sm font-bold text-kore-ink mb-1.5">
              Equipamento
            </label>
            <select
              id={`edit-equipment-${exercise.id}`}
              name="equipment"
              defaultValue={exercise.category?.toLowerCase() || ""}
              className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition appearance-none"
              required
            >
              <option value="" disabled>Selecione...</option>
              <option value="halteres">Halteres</option>
              <option value="barra">Barra</option>
              <option value="polia">Polia</option>
              <option value="maquina">Máquina</option>
              <option value="peso corporal">Peso Corporal</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor={`edit-videoUrl-${exercise.id}`} className="block text-sm font-bold text-kore-ink mb-1.5">
            Link de Vídeo Demonstrativo
          </label>
          <input
            id={`edit-videoUrl-${exercise.id}`}
            name="videoUrl"
            type="url"
            defaultValue={exercise.image_url || ""}
            placeholder="Ex: https://youtube.com/..."
            className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
          />
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-kore-border mt-6">
          <button
            type="button"
            disabled={isPending || isDeleting}
            onClick={handleDelete}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {isDeleting ? "Deletando..." : "Excluir Exercício"}
          </button>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending || isDeleting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold text-kore-subink hover:text-kore-ink hover:bg-kore-bg transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || isDeleting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-kore-emerald disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
