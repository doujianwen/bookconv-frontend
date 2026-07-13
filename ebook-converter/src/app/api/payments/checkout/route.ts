'use server';

import { NextResponse } from 'next/server';
import { getPlanById, formatPrice } from '@/lib/payments/service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, email, metadata } = body;

    if (!planId || !email) {
      return NextResponse.json(
        { error: 'Missing planId or email' },
        { status: 400 }
      );
    }

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Free plan — no payment needed
    if (plan.priceCents === 0) {
      return NextResponse.json({
        success: true,
        message: 'Free plan activated',
        plan: { id: plan.id, name: plan.name, price: '$0' },
      });
    }

    // Get variant ID from env
    const variantId = plan.lemonSqueezyVariantId;
    if (!variantId) {
      return NextResponse.json(
        { error: 'Payment not configured yet' },
        { status: 503 }
      );
    }

    // Create Lemon Squeezy checkout session
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {},
          relationships: {
            store: {
              data: { type: 'stores', id: process.env.LEMON_SQUEEZY_STORE_ID },
            },
            variant: {
              data: { type: 'variants', id: variantId },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Lemon Squeezy error:', error);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    const checkoutData = await response.json();
    const checkoutUrl = checkoutData.data.attributes.url;

    return NextResponse.json({
      success: true,
      checkoutUrl,
      plan: {
        id: plan.id,
        name: plan.name,
        price: formatPrice(plan.priceCents),
      },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
