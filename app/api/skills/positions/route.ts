import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const { positions } = await request.json() as {
      positions: { skillId: string; x: number; y: number }[];
    };

    await prisma.$transaction(
      positions.map(({ skillId, x, y }) =>
        prisma.skill.update({
          where: { id: skillId },
          data: { positionX: x, positionY: y },
        })
      )
    );

    revalidatePath('/tree', 'page'); 
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar posições:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}