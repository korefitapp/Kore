import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// O caminho relativo sobe 3 pastas (seed-exercises -> api -> app -> raiz) para achar o JSON
import exercisesData from '../../../seed.json';

export async function GET() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
        .from('exercises')
        .insert(exercisesData);

    if (error) {
        console.error('Erro no Seed:', error);
        return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json({
        sucesso: true,
        mensagem: 'Seed de exercícios finalizado com sucesso!',
        quantidade_inserida: exercisesData.length
    });
}