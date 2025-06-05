import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get user's funds data
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's balance stats
    const balanceStats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        availableBalance: true,
        pendingBalance: true,
        totalEarnings: true,
        withdrawnAmount: true,
      },
    });

    // Get user's transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        newsletter: {
          select: { title: true },
        },
      },
    });

    // Get user's withdrawal methods
    const withdrawalMethods = await prisma.withdrawalMethod.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      balanceStats,
      transactions: transactions.map(t => ({
        ...t,
        newsletter: t.newsletter?.title || null,
      })),
      withdrawalMethods,
    });
  } catch (error) {
    console.error('Error fetching funds data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funds data' },
      { status: 500 }
    );
  }
} 