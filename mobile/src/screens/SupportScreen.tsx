import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface SupportScreenProps {
  onBack: () => void;
  onNavigateAuth: () => void;
}

interface TicketMessage {
  senderRole: string;
  senderName?: string;
  message: string;
  createdAt: string;
}

interface SupportTicket {
  _id: string;
  ticketId: string;
  subject: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: string;
  messages: TicketMessage[];
  createdAt: string;
}

const FAQS = [
  {
    q: 'How do I track my Aurelia shipment?',
    a: 'Navigate to My Orders and select your active acquisition to view the live White-Glove signature tracking timeline showing Ordered, Inspected, Handcrafted, and Out for Delivery.'
  },
  {
    q: 'What is the return and exchange policy?',
    a: 'We offer a complimentary 7-day white-glove return and exchange service for all authenticated pieces in their original packaging and security seals intact.'
  },
  {
    q: 'Can I cancel an order after placing it?',
    a: 'Yes, bespoke orders may be modified or cancelled prior to atelier dispatch. Instant refunds are processed to your original payment method.'
  },
  {
    q: 'What payment modes are supported?',
    a: 'We accept Razorpay (UPI, Luxury Cards, NetBanking, International Cards) and Private Cash on Delivery for eligible residences.'
  },
  {
    q: 'How do I apply promotional courtesy codes?',
    a: 'Enter your exclusive privilege code (e.g., AURELIA10, PRIVE500, or MAISON2026) in the Shopping Bag screen before private checkout.'
  }
];

export const SupportScreen: React.FC<SupportScreenProps> = ({ onBack, onNavigateAuth }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'FAQS' | 'MY_TICKETS' | 'RAISE_TICKET'>('FAQS');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Raise ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'ORDER' | 'PAYMENT' | 'DELIVERY' | 'RETURN' | 'GENERAL'>('ORDER');
  const [message, setMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'MY_TICKETS' && user) {
      fetchTickets();
    }
  }, [activeTab, user]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await mobileApi.get('/support/my-tickets');
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching tickets:', e);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Please enter a subject and message');
      return;
    }
    try {
      setSubmittingTicket(true);
      const res = await mobileApi.post('/support', {
        subject: subject.trim(),
        category,
        message: message.trim()
      });
      if (res.data.success) {
        setSuccessMsg('Your support ticket has been submitted. Our team will respond shortly!');
        setSubject('');
        setMessage('');
        fetchTickets();
        setTimeout(() => {
          setSuccessMsg(null);
          setActiveTab('MY_TICKETS');
        }, 2000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    try {
      setSendingReply(true);
      const res = await mobileApi.post(`/support/${selectedTicket._id}/messages`, {
        message: replyText.trim()
      });
      if (res.data.success) {
        setSelectedTicket(res.data.data);
        setReplyText('');
        fetchTickets();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { bg: '#E3F2FD', text: '#1976D2' };
      case 'IN_PROGRESS':
        return { bg: '#FFF8E1', text: '#F57F17' };
      case 'RESOLVED':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'CLOSED':
        return { bg: '#EEEEEE', text: '#616161' };
      default:
        return { bg: '#EEEEEE', text: '#616161' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#FAF9F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maison Concierge & Support</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'FAQS' && styles.activeTabBtn]}
          onPress={() => {
            setActiveTab('FAQS');
            setSelectedTicket(null);
          }}
        >
          <Text style={[styles.tabBtnText, activeTab === 'FAQS' && styles.activeTabBtnText]}>
            Help FAQs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'MY_TICKETS' && styles.activeTabBtn]}
          onPress={() => {
            setActiveTab('MY_TICKETS');
            setSelectedTicket(null);
          }}
        >
          <Text style={[styles.tabBtnText, activeTab === 'MY_TICKETS' && styles.activeTabBtnText]}>
            My Tickets
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'RAISE_TICKET' && styles.activeTabBtn]}
          onPress={() => {
            setActiveTab('RAISE_TICKET');
            setSelectedTicket(null);
          }}
        >
          <Text style={[styles.tabBtnText, activeTab === 'RAISE_TICKET' && styles.activeTabBtnText]}>
            Raise Ticket
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FAQs TAB */}
        {activeTab === 'FAQS' && (
          <View>
            <View style={styles.bannerBox}>
              <Ionicons name="chatbubbles" size={24} color="#2874F0" />
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>Frequently Asked Questions</Text>
                <Text style={styles.bannerSub}>Quick answers to common order & shipping inquiries</Text>
              </View>
            </View>

            <View style={styles.faqList}>
              {FAQS.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <View key={idx} style={styles.faqCard}>
                    <TouchableOpacity
                      style={styles.faqHeader}
                      onPress={() => setExpandedFaq(isOpen ? null : idx)}
                    >
                      <Text style={styles.faqQuestion}>{faq.q}</Text>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#757575"
                      />
                    </TouchableOpacity>
                    {isOpen && (
                      <View style={styles.faqBody}>
                        <Text style={styles.faqAnswer}>{faq.a}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.raiseBannerBtn}
              onPress={() => setActiveTab('RAISE_TICKET')}
            >
              <Text style={styles.raiseBannerBtnText}>Need more help? Raise a Support Ticket</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* MY TICKETS TAB */}
        {activeTab === 'MY_TICKETS' && (
          <View>
            {!user ? (
              <View style={styles.authRequiredCard}>
                <Ionicons name="lock-closed-outline" size={40} color="#2874F0" />
                <Text style={styles.authRequiredTitle}>Sign in to view your tickets</Text>
                <TouchableOpacity style={styles.authBtn} onPress={onNavigateAuth}>
                  <Text style={styles.authBtnText}>LOG IN</Text>
                </TouchableOpacity>
              </View>
            ) : selectedTicket ? (
              /* Ticket Detail & Thread View */
              <View style={styles.ticketDetailContainer}>
                <TouchableOpacity
                  style={styles.backToTicketsBtn}
                  onPress={() => setSelectedTicket(null)}
                >
                  <Ionicons name="arrow-back" size={16} color="#2874F0" />
                  <Text style={styles.backToTicketsText}>Back to all tickets</Text>
                </TouchableOpacity>

                <View style={styles.ticketDetailCard}>
                  <View style={styles.detailHeader}>
                    <Text style={styles.ticketIdText}>Ticket #{selectedTicket.ticketId || selectedTicket._id.slice(-6)}</Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: getStatusBadge(selectedTicket.status).bg }
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: getStatusBadge(selectedTicket.status).text }
                        ]}
                      >
                        {selectedTicket.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.detailSubject}>{selectedTicket.subject}</Text>
                  <Text style={styles.detailCategory}>Category: {selectedTicket.category}</Text>
                </View>

                {/* Messages Thread */}
                <Text style={styles.threadTitle}>Conversation History</Text>
                <View style={styles.threadContainer}>
                  {selectedTicket.messages && selectedTicket.messages.map((m, idx) => {
                    const isStaff = m.senderRole !== 'CUSTOMER';
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.messageBubble,
                          isStaff ? styles.staffBubble : styles.customerBubble
                        ]}
                      >
                        <View style={styles.messageHeader}>
                          <Text style={styles.senderText}>
                            {isStaff ? 'Aurelia Concierge Specialist' : 'You'}
                          </Text>
                          <Text style={styles.messageTime}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        <Text style={styles.messageContent}>{m.message}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Reply Box */}
                {selectedTicket.status !== 'CLOSED' && (
                  <View style={styles.replyBox}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder="Write your reply..."
                      value={replyText}
                      onChangeText={setReplyText}
                      multiline
                    />
                    <TouchableOpacity
                      style={styles.sendReplyBtn}
                      onPress={handleSendReply}
                      disabled={sendingReply}
                    >
                      {sendingReply ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Ionicons name="send" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : loadingTickets ? (
              <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2874F0" />
            ) : tickets.length === 0 ? (
              <View style={styles.emptyTickets}>
                <Ionicons name="ticket-outline" size={54} color="#BDBDBD" />
                <Text style={styles.emptyTitle}>No Open Complaints or Tickets</Text>
                <Text style={styles.emptySub}>
                  You have not raised any support requests yet.
                </Text>
                <TouchableOpacity
                  style={styles.raiseTicketNowBtn}
                  onPress={() => setActiveTab('RAISE_TICKET')}
                >
                  <Text style={styles.raiseTicketNowBtnText}>RAISE A TICKET</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.ticketList}>
                {tickets.map((t) => (
                  <TouchableOpacity
                    key={t._id}
                    style={styles.ticketCard}
                    onPress={() => setSelectedTicket(t)}
                  >
                    <View style={styles.ticketCardTop}>
                      <Text style={styles.ticketId}>#{t.ticketId || t._id.slice(-6)}</Text>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: getStatusBadge(t.status).bg }
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: getStatusBadge(t.status).text }
                          ]}
                        >
                          {t.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.ticketSubject} numberOfLines={1}>
                      {t.subject}
                    </Text>
                    <View style={styles.ticketFooter}>
                      <Text style={styles.ticketCategory}>{t.category}</Text>
                      <Text style={styles.ticketDate}>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* RAISE TICKET TAB */}
        {activeTab === 'RAISE_TICKET' && (
          <View>
            {!user ? (
              <View style={styles.authRequiredCard}>
                <Ionicons name="lock-closed-outline" size={40} color="#2874F0" />
                <Text style={styles.authRequiredTitle}>Sign in to create a support ticket</Text>
                <TouchableOpacity style={styles.authBtn} onPress={onNavigateAuth}>
                  <Text style={styles.authBtnText}>LOG IN</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Submit a Complaint or Inquiry</Text>

                {successMsg && (
                  <View style={styles.successBanner}>
                    <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                    <Text style={styles.successText}>{successMsg}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Subject *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Delay in delivering order #OD1002"
                  value={subject}
                  onChangeText={setSubject}
                />

                <Text style={styles.inputLabel}>Category *</Text>
                <View style={styles.categoryPills}>
                  {(['ORDER', 'PAYMENT', 'DELIVERY', 'RETURN', 'GENERAL'] as const).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catPill, category === cat && styles.activeCatPill]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.catPillText,
                          category === cat && styles.activeCatPillText
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Description / Message *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Please provide details about your issue so our customer care team can resolve it quickly..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleCreateTicket}
                  disabled={submittingTicket}
                >
                  {submittingTicket ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>SUBMIT TICKET</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F3F6'
  },
  header: {
    backgroundColor: '#0A0A0E',
    paddingTop: Platform.OS === 'ios' ? 52 : 44,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)'
  },
  backBtn: {
    padding: 4
  },
  headerTitle: {
    color: '#FAF9F6',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE7DF'
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTabBtn: {
    borderBottomColor: '#D4AF37'
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8A93'
  },
  activeTabBtnText: {
    color: '#111115',
    fontWeight: '700'
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40
  },
  bannerBox: {
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C2D7FA'
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A73E8'
  },
  bannerSub: {
    fontSize: 12,
    color: '#424242',
    marginTop: 2
  },
  faqList: {
    gap: 8
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14
  },
  faqQuestion: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    marginRight: 10
  },
  faqBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5'
  },
  faqAnswer: {
    fontSize: 12,
    color: '#616161',
    lineHeight: 18,
    marginTop: 8
  },
  raiseBannerBtn: {
    backgroundColor: '#FB641B',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8
  },
  raiseBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  authRequiredCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20
  },
  authRequiredTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginTop: 12,
    marginBottom: 16
  },
  authBtn: {
    backgroundColor: '#2874F0',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 6
  },
  authBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  ticketList: {
    gap: 10
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  ticketCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  ticketId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#757575'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  ticketSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  ticketCategory: {
    fontSize: 11,
    color: '#2874F0',
    fontWeight: '600'
  },
  ticketDate: {
    fontSize: 11,
    color: '#9E9E9E'
  },
  emptyTickets: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginTop: 10
  },
  emptySub: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    marginBottom: 16
  },
  raiseTicketNowBtn: {
    backgroundColor: '#2874F0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6
  },
  raiseTicketNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  ticketDetailContainer: {
    gap: 12
  },
  backToTicketsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  backToTicketsText: {
    color: '#2874F0',
    fontSize: 13,
    fontWeight: '600'
  },
  ticketDetailCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  ticketIdText: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '700'
  },
  detailSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4
  },
  detailCategory: {
    fontSize: 12,
    color: '#2874F0',
    fontWeight: '600'
  },
  threadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#424242',
    marginTop: 6
  },
  threadContainer: {
    gap: 10
  },
  messageBubble: {
    padding: 12,
    borderRadius: 8,
    maxWidth: '85%'
  },
  customerBubble: {
    backgroundColor: '#E8F0FE',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2
  },
  staffBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4
  },
  senderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2874F0'
  },
  messageTime: {
    fontSize: 10,
    color: '#9E9E9E'
  },
  messageContent: {
    fontSize: 13,
    color: '#212121',
    lineHeight: 18
  },
  replyBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#D4D4D4'
  },
  replyInput: {
    flex: 1,
    fontSize: 13,
    color: '#212121',
    maxHeight: 80,
    paddingHorizontal: 8
  },
  sendReplyBtn: {
    backgroundColor: '#2874F0',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end'
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12
  },
  successText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600'
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#212121'
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top'
  },
  categoryPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    backgroundColor: '#FAFAFA'
  },
  activeCatPill: {
    borderColor: '#2874F0',
    backgroundColor: '#E8F0FE'
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#616161'
  },
  activeCatPillText: {
    color: '#2874F0'
  },
  submitBtn: {
    backgroundColor: '#FB641B',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
