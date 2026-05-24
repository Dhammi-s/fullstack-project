import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ordersApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/UI';
import { Printer, ArrowLeft, Download } from 'lucide-react';

export default function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    ordersApi.get(id)
      .then(r => {
        const o = r.data;
        // Only Customer (owner) or assigned Worker can view
        const isOwner = o.customerId === user?.userId;
        const isWorker = user?.role === 'Worker' && o.workerId === user?.userId;
        if (!isOwner && !isWorker) {
          navigate('/unauthorized');
          return;
        }
        setOrder(o);
      })
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>Invoice #${order.orderNumber}</title>
        <meta charset="UTF-8"/>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background:#fff; color:#1a1a2e; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!order) return null;

  const isPaid = order.paymentStatus === 'Paid';
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dueDate = new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      {/* Action Bar — hidden on print */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link to="/orders" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="flex gap-3">
          <button onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors">
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors">
            <Download className="w-4 h-4" /> Save as PDF
          </button>
        </div>
      </div>

      {/* ── Invoice Document ── */}
      <div ref={printRef} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 32px rgba(0,0,0,0.10)', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#1E40AF,#2563EB)', padding: '40px 48px', position: 'relative', overflow: 'hidden' }}>
            {/* decorative circles */}
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ position: 'absolute', bottom: '-60px', right: '60px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'top' }}>
                    {/* Logo */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🔧</div>
                      <span style={{ color: '#fff', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>DailyNeeds</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', margin: 0 }}>Your trusted home services platform</p>
                  </td>
                  <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                    <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>Invoice</p>
                    <p style={{ color: '#fff', fontSize: '28px', fontWeight: '800', margin: '0 0 6px', letterSpacing: '0.5px' }}>#{order.orderNumber}</p>
                    <p style={{ color: 'rgba(255,255,255,0.70)', fontSize: '13px', margin: 0 }}>{invoiceDate}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Status Banner */}
          <div style={{
            background: isPaid ? '#F0FDF4' : '#FFFBEB',
            borderBottom: `1px solid ${isPaid ? '#BBF7D0' : '#FDE68A'}`,
            padding: '14px 48px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: isPaid ? '#16A34A' : '#D97706'
            }} />
            <span style={{ fontSize: '13px', fontWeight: '700', color: isPaid ? '#166534' : '#92400E', letterSpacing: '0.3px' }}>
              {isPaid ? '✓ Payment Received — Thank you!' : '⏳ Payment Pending — Please complete your payment'}
            </span>
          </div>

          <div style={{ padding: '40px 48px' }}>

            {/* Billed From / To */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '36px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '24px' }}>
                    <p style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700', margin: '0 0 12px' }}>From</p>
                    <p style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: '0 0 4px' }}>DailyNeeds</p>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 2px' }}>jassadhammi@gmail.com</p>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>dailyneeds.vercel.app</p>
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '24px', borderLeft: '1px solid #F1F5F9' }}>
                    <p style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700', margin: '0 0 12px' }}>Billed To</p>
                    <p style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: '0 0 4px' }}>{order.customerName}</p>
                    {order.address && <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 2px' }}>{order.address}</p>}
                    {order.workerName && (
                      <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                        Worker: <span style={{ fontWeight: '600', color: '#334155' }}>{order.workerName}</span>
                      </p>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Invoice Meta */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 24px', marginBottom: '32px' }}>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tbody>
                  <tr>
                    {[
                      { label: 'Invoice Date', value: invoiceDate },
                      { label: 'Due Date', value: dueDate },
                      { label: 'Payment Method', value: order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Online' },
                      { label: 'Order Type', value: order.orderType },
                    ].map((item, i) => (
                      <td key={i} style={{ textAlign: 'center', padding: '0 8px', borderRight: i < 3 ? '1px solid #E2E8F0' : 'none' }}>
                        <p style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', margin: '0 0 5px' }}>{item.label}</p>
                        <p style={{ fontSize: '13px', color: '#1E293B', fontWeight: '700', margin: 0 }}>{item.value}</p>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Line Items Table */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <thead>
                <tr style={{ background: '#1E293B' }}>
                  {['#', 'Description', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                    <th key={i} style={{
                      padding: '13px 16px', fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase',
                      letterSpacing: '1px', fontWeight: '700', textAlign: i >= 2 ? 'right' : 'left'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Service row */}
                {order.serviceTitle && (
                  <tr style={{ background: '#fff', borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#94A3B8' }}>1</td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: '0 0 2px' }}>{order.serviceTitle}</p>
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Home Service</p>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>1</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>${Number(order.totalAmount).toFixed(2)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#1E293B', textAlign: 'right' }}>${Number(order.totalAmount).toFixed(2)}</td>
                  </tr>
                )}

                {/* Product items */}
                {order.items?.map((item, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#fff', borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#94A3B8' }}>{(order.serviceTitle ? i + 2 : i + 1)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: '0 0 2px' }}>{item.productName}</p>
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Product</p>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>${Number(item.unitPrice).toFixed(2)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#1E293B', textAlign: 'right' }}>${Number(item.totalPrice).toFixed(2)}</td>
                  </tr>
                ))}

                {/* Totals */}
                <tr style={{ background: '#F8FAFC' }}>
                  <td colSpan="3" />
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B', fontWeight: '600', textAlign: 'right', borderTop: '1px solid #E2E8F0' }}>Subtotal</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1E293B', fontWeight: '700', textAlign: 'right', borderTop: '1px solid #E2E8F0' }}>${Number(order.totalAmount).toFixed(2)}</td>
                </tr>
                <tr style={{ background: '#F8FAFC' }}>
                  <td colSpan="3" />
                  <td style={{ padding: '8px 16px', fontSize: '13px', color: '#64748B', fontWeight: '600', textAlign: 'right' }}>Tax (0%)</td>
                  <td style={{ padding: '8px 16px', fontSize: '13px', color: '#1E293B', fontWeight: '700', textAlign: 'right' }}>$0.00</td>
                </tr>
                <tr style={{ background: isPaid ? '#F0FDF4' : '#FFFBEB' }}>
                  <td colSpan="3" />
                  <td style={{ padding: '14px 16px', fontSize: '15px', color: '#1E293B', fontWeight: '800', textAlign: 'right', borderTop: '2px solid #E2E8F0' }}>Total</td>
                  <td style={{ padding: '14px 16px', fontSize: '18px', fontWeight: '900', color: isPaid ? '#16A34A' : '#D97706', textAlign: 'right', borderTop: '2px solid #E2E8F0' }}>${Number(order.totalAmount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* ── PAID / PENDING STAMP ── */}
            <div style={{ position: 'relative', marginTop: '32px', marginBottom: '32px' }}>
              {isPaid ? (
                <div style={{
                  display: 'inline-block',
                  border: '4px solid #16A34A',
                  borderRadius: '8px',
                  padding: '8px 28px',
                  transform: 'rotate(-8deg)',
                  position: 'absolute',
                  right: '0',
                  top: '-60px',
                  opacity: 0.88,
                  pointerEvents: 'none'
                }}>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#16A34A', letterSpacing: '4px', textTransform: 'uppercase', lineHeight: 1 }}>PAID</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#16A34A', fontWeight: '600', letterSpacing: '1px', textAlign: 'center' }}>{invoiceDate}</p>
                </div>
              ) : (
                <div style={{
                  display: 'inline-block',
                  border: '4px solid #D97706',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  transform: 'rotate(-8deg)',
                  position: 'absolute',
                  right: '0',
                  top: '-60px',
                  opacity: 0.85,
                  pointerEvents: 'none'
                }}>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#D97706', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1 }}>PAYMENT</p>
                  <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '900', color: '#D97706', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1 }}>PENDING</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#D97706', fontWeight: '600', letterSpacing: '1px', textAlign: 'center' }}>Due: {dueDate}</p>
                </div>
              )}
            </div>

            {/* Notes / Scheduled */}
            {(order.notes || order.scheduledAt) && (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
                {order.scheduledAt && (
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#475569' }}>
                    <strong>Scheduled:</strong> {new Date(order.scheduledAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                  </p>
                )}
                {order.notes && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                    <strong>Notes:</strong> {order.notes}
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#94A3B8', margin: '0 0 4px' }}>
                Thank you for choosing <strong style={{ color: '#2563EB' }}>DailyNeeds</strong> 💙
              </p>
              <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>
                Questions? Contact us at jassadhammi@gmail.com · dailyneeds.vercel.app
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
