<?php
/**
 * Chatbot Chat API
 * Main endpoint for handling chat messages and generating responses
 */

require_once __DIR__ . '/../config.php';

// Create chat sessions table if not exists
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS chatbot_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(100) NOT NULL UNIQUE,
            lead_name VARCHAR(100),
            lead_email VARCHAR(255),
            lead_location VARCHAR(200),
            lead_interest VARCHAR(200),
            lead_timezone VARCHAR(50),
            conversation_stage VARCHAR(50) DEFAULT 'greeting',
            messages JSON,
            lead_score INT DEFAULT 0,
            is_qualified BOOLEAN DEFAULT FALSE,
            booking_date DATETIME,
            booking_confirmed BOOLEAN DEFAULT FALSE,
            deal_confirmed BOOLEAN DEFAULT FALSE,
            deal_service VARCHAR(200),
            deal_price DECIMAL(10,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_session (session_id),
            INDEX idx_email (lead_email),
            INDEX idx_qualified (is_qualified)
        )
    ");
} catch (PDOException $e) {
    // Table might already exist
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['message'])) {
    json_response(['error' => 'Message is required'], 400);
    exit;
}

$sessionId = sanitize_input($data['session_id'] ?? generateSessionId());
$userMessage = sanitize_input($data['message']);
$userTimezone = sanitize_input($data['timezone'] ?? 'Asia/Kolkata');

// Get or create session
$session = getOrCreateSession($sessionId);

// Get chatbot config
$config = getChatbotConfig();

// Process message and generate response
$response = processMessage($userMessage, $session, $config, $userTimezone);

// Update session
updateSession($sessionId, $response['session_updates'], $userMessage, $response['message']);

// Send to Google Sheets if lead info collected
if ($response['send_to_sheet'] && !empty($config['google_sheet_webhook'])) {
    sendToGoogleSheet($session, $config['google_sheet_webhook']);
}

json_response([
    'success' => true,
    'session_id' => $sessionId,
    'message' => $response['message'],
    'suggestions' => $response['suggestions'] ?? [],
    'show_booking' => $response['show_booking'] ?? false,
    'booking_link' => $response['show_booking'] ? $config['booking_link'] : null,
    'collect_info' => $response['collect_info'] ?? null,
    'deal_confirmed' => $response['deal_confirmed'] ?? false
]);

function generateSessionId() {
    return 'chat_' . bin2hex(random_bytes(16));
}

function getOrCreateSession($sessionId) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT * FROM chatbot_sessions WHERE session_id = ?");
    $stmt->execute([$sessionId]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$session) {
        $stmt = $pdo->prepare("INSERT INTO chatbot_sessions (session_id, messages) VALUES (?, '[]')");
        $stmt->execute([$sessionId]);
        
        return [
            'session_id' => $sessionId,
            'conversation_stage' => 'greeting',
            'messages' => [],
            'lead_name' => null,
            'lead_email' => null,
            'lead_location' => null,
            'lead_interest' => null,
            'lead_score' => 0
        ];
    }
    
    $session['messages'] = json_decode($session['messages'], true) ?: [];
    return $session;
}

function getChatbotConfig() {
    global $pdo;
    
    $stmt = $pdo->query("SELECT * FROM chatbot_config WHERE id = 1");
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function processMessage($userMessage, $session, $config, $userTimezone) {
    global $pdo;
    
    $message = strtolower($userMessage);
    $stage = $session['conversation_stage'];
    $response = [
        'message' => '',
        'suggestions' => [],
        'show_booking' => false,
        'collect_info' => null,
        'send_to_sheet' => false,
        'deal_confirmed' => false,
        'session_updates' => []
    ];
    
    // Check for collected info patterns
    $collectedInfo = extractInfo($userMessage, $session);
    if ($collectedInfo) {
        $response['session_updates'] = array_merge($response['session_updates'], $collectedInfo);
    }
    
    // Determine conversation stage and response
    if ($stage === 'greeting' || empty($session['lead_name'])) {
        // Still collecting basic info
        if (empty($session['lead_name'])) {
            if (preg_match('/(?:my name is|i\'m|i am|call me)\s+([a-zA-Z\s]+)/i', $userMessage, $matches)) {
                $response['session_updates']['lead_name'] = trim($matches[1]);
                $response['message'] = "Nice to meet you, " . trim($matches[1]) . "! 😊 Could you share your email address so I can send you relevant information?";
                $response['collect_info'] = 'email';
            } else {
                $response['message'] = "Before we continue, may I know your name? It helps me personalize our conversation!";
                $response['collect_info'] = 'name';
            }
        } elseif (empty($session['lead_email'])) {
            if (filter_var($userMessage, FILTER_VALIDATE_EMAIL)) {
                $response['session_updates']['lead_email'] = $userMessage;
                $response['message'] = "Perfect! Where are you located? This helps me understand your timezone and market better.";
                $response['collect_info'] = 'location';
            } else {
                $response['message'] = "Could you please share your email address? Don't worry, we respect your privacy!";
                $response['collect_info'] = 'email';
            }
        } elseif (empty($session['lead_location'])) {
            $response['session_updates']['lead_location'] = $userMessage;
            $response['session_updates']['lead_timezone'] = $userTimezone;
            $response['message'] = "Great! What brings you to HireMediaMind today? Are you interested in:\n\n🎯 **Performance Marketing** - Paid ads, lead generation, ROAS optimization\n\n🤖 **AI Automation** - Chatbots, workflows, CRM automation\n\n💎 **AI Lead Engine** - Our done-for-you lead generation system";
            $response['suggestions'] = ['Performance Marketing', 'AI Automation', 'AI Lead Engine', 'Not sure yet'];
            $response['session_updates']['conversation_stage'] = 'discovery';
            $response['send_to_sheet'] = true; // Send initial lead info
        }
    } else {
        // Search knowledge base for relevant answers
        $knowledgeResponse = searchKnowledgeBase($userMessage);
        
        if ($knowledgeResponse) {
            $response['message'] = $knowledgeResponse;
        } else {
            // Handle specific intents
            if (containsAny($message, ['price', 'cost', 'pricing', 'how much', 'rate', 'package'])) {
                $response = handlePricingIntent($session, $response);
            } elseif (containsAny($message, ['book', 'call', 'meeting', 'schedule', 'appointment'])) {
                $response = handleBookingIntent($session, $config, $userTimezone, $response);
            } elseif (containsAny($message, ['deal', 'confirm', 'proceed', 'start', 'begin', 'yes i want', 'let\'s do'])) {
                $response = handleDealIntent($session, $response);
            } elseif (containsAny($message, ['performance', 'ads', 'marketing', 'ppc', 'facebook', 'google ads', 'meta'])) {
                $response['session_updates']['lead_interest'] = 'Performance Marketing';
                $response['message'] = "Excellent choice! Our **Performance Marketing** service helps businesses like yours generate qualified leads at scale.\n\n📊 **What we do:**\n• Meta & Google Ads management\n• Landing page optimization\n• Lead generation campaigns\n• ROAS tracking & optimization\n\n**Our clients typically see 3-5x ROAS within 90 days.**\n\nWould you like to know about our pricing packages or discuss your specific goals?";
                $response['suggestions'] = ['Show me pricing', 'Book a strategy call', 'Tell me more'];
            } elseif (containsAny($message, ['automation', 'ai', 'chatbot', 'workflow', 'crm', 'automate'])) {
                $response['session_updates']['lead_interest'] = 'AI Automation';
                $response['message'] = "Great interest! Our **AI Automation** solutions save businesses 10-20 hours per week.\n\n🤖 **What we offer:**\n• Custom AI chatbots (like me!)\n• Lead nurturing automation\n• CRM & workflow automation\n• WhatsApp & Email automation\n\n**Most clients see ROI within 30 days.**\n\nWant to see our automation packages or discuss your needs?";
                $response['suggestions'] = ['Show me pricing', 'Book a demo call', 'How does it work?'];
            } elseif (containsAny($message, ['lead engine', 'done for you', 'complete solution', 'full service'])) {
                $response['session_updates']['lead_interest'] = 'AI Lead Engine';
                $response['message'] = "The **AI Lead Engine** is our premium done-for-you solution! 🚀\n\n💎 **What's included:**\n• Complete lead generation system\n• AI-powered qualification\n• Automated follow-up sequences\n• CRM integration\n• Monthly optimization\n\n**Launch Price: $497 (One-time)**\n\nThis is perfect for businesses that want results without the learning curve. Would you like to learn more or reserve your spot?";
                $response['suggestions'] = ['Tell me more', 'I want to buy', 'Book a call first'];
            } else {
                // Use fallback message
                $response['message'] = $config['fallback_message'];
                $response['suggestions'] = ['Performance Marketing', 'AI Automation', 'Book a call'];
            }
        }
    }
    
    // Update lead score based on engagement
    $response['session_updates']['lead_score'] = calculateLeadScore($session, $response['session_updates']);
    
    return $response;
}

function searchKnowledgeBase($query) {
    global $pdo;
    
    try {
        // Try full-text search first
        $stmt = $pdo->prepare("
            SELECT answer, 
                   MATCH(question, keywords, answer) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
            FROM chatbot_knowledge 
            WHERE is_active = TRUE 
              AND MATCH(question, keywords, answer) AGAINST(? IN NATURAL LANGUAGE MODE)
            ORDER BY priority DESC, relevance DESC
            LIMIT 1
        ");
        $stmt->execute([$query, $query]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && $result['relevance'] > 0.5) {
            return $result['answer'];
        }
        
        // Try keyword matching
        $words = array_filter(explode(' ', strtolower($query)), function($w) {
            return strlen($w) > 3;
        });
        
        if (!empty($words)) {
            $conditions = array_map(function($word) {
                return "(keywords LIKE ? OR question LIKE ?)";
            }, $words);
            
            $params = [];
            foreach ($words as $word) {
                $params[] = '%' . $word . '%';
                $params[] = '%' . $word . '%';
            }
            
            $sql = "SELECT answer FROM chatbot_knowledge WHERE is_active = TRUE AND (" . 
                   implode(' OR ', $conditions) . ") ORDER BY priority DESC LIMIT 1";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                return $result['answer'];
            }
        }
    } catch (PDOException $e) {
        // Fall through to return null
    }
    
    return null;
}

function extractInfo($message, $session) {
    $info = [];
    
    // Extract email
    if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $message, $matches)) {
        $info['lead_email'] = $matches[0];
    }
    
    // Extract name patterns
    if (preg_match('/(?:my name is|i\'m|i am|call me)\s+([a-zA-Z\s]+)/i', $message, $matches)) {
        $info['lead_name'] = trim($matches[1]);
    }
    
    return $info;
}

function handlePricingIntent($session, $response) {
    $interest = $session['lead_interest'] ?? 'general';
    
    if (strpos(strtolower($interest), 'performance') !== false) {
        $response['message'] = "Here are our **Performance Marketing** packages:\n\n" .
            "🥉 **Starter** - \$997/month\n• Up to \$5K ad spend management\n• 2 campaigns\n• Weekly reporting\n\n" .
            "🥈 **Growth** - \$1,997/month\n• Up to \$15K ad spend management\n• 4 campaigns\n• Bi-weekly calls\n\n" .
            "🥇 **Scale** - \$3,997/month\n• Unlimited ad spend management\n• Unlimited campaigns\n• Weekly calls + Slack support\n\n" .
            "Which package interests you? Or would you prefer a custom quote?";
    } elseif (strpos(strtolower($interest), 'automation') !== false) {
        $response['message'] = "Here are our **AI Automation** packages:\n\n" .
            "🤖 **Starter** - \$497 (one-time) + \$97/month\n• 1 AI chatbot\n• Basic automation\n• Email support\n\n" .
            "⚡ **Pro** - \$1,497 (one-time) + \$197/month\n• Multiple chatbots\n• Advanced workflows\n• Priority support\n\n" .
            "🚀 **Scale** - \$2,997 (one-time) + \$397/month\n• Custom AI solutions\n• Full CRM integration\n• Dedicated support\n\n" .
            "Which level matches your needs?";
    } else {
        $response['message'] = "We have different pricing based on your needs:\n\n" .
            "🎯 **Performance Marketing**: Starting at \$997/month\n" .
            "🤖 **AI Automation**: Starting at \$497 setup + \$97/month\n" .
            "💎 **AI Lead Engine**: \$497 one-time\n\n" .
            "What service are you most interested in? I can give you detailed pricing!";
    }
    
    $response['suggestions'] = ['Performance Marketing pricing', 'AI Automation pricing', 'AI Lead Engine', 'Book a call'];
    return $response;
}

function handleBookingIntent($session, $config, $userTimezone, $response) {
    $ist = new DateTimeZone('Asia/Kolkata');
    $userTz = new DateTimeZone($userTimezone);
    
    $now = new DateTime('now', $ist);
    $userNow = new DateTime('now', $userTz);
    
    $isInternational = $userTimezone !== 'Asia/Kolkata';
    
    $response['message'] = "I'd love to set up a strategy call for you! 📞\n\n";
    
    if ($isInternational) {
        $response['message'] .= "I noticed you're in a different timezone. Our team operates in **IST (Indian Standard Time)**.\n\n";
        $response['message'] .= "Your current time: " . $userNow->format('g:i A') . " (" . $userTimezone . ")\n";
        $response['message'] .= "Our time: " . $now->format('g:i A') . " IST\n\n";
    }
    
    $response['message'] .= "You can book a 30-minute strategy call where we'll:\n" .
        "✅ Analyze your current marketing\n" .
        "✅ Identify growth opportunities\n" .
        "✅ Create a custom action plan\n\n" .
        "Click below to choose your preferred time slot:";
    
    $response['show_booking'] = true;
    $response['suggestions'] = ['I have questions first', 'Tell me about services'];
    
    return $response;
}

function handleDealIntent($session, $response) {
    $interest = $session['lead_interest'] ?? '';
    
    if (empty($session['lead_name']) || empty($session['lead_email'])) {
        $response['message'] = "Excellent! I'm excited to help you get started! 🎉\n\nBefore we proceed, could you share your details so our team can reach out?\n\nWhat's your name?";
        $response['collect_info'] = 'name';
        return $response;
    }
    
    $response['message'] = "🎉 **Fantastic!** I'm thrilled you're ready to move forward!\n\n" .
        "**Here's what happens next:**\n\n" .
        "1️⃣ Our team will reach out within 24 hours\n" .
        "2️⃣ We'll schedule an onboarding call\n" .
        "3️⃣ You'll receive your welcome package\n\n" .
        "**Your Details:**\n" .
        "📛 Name: " . $session['lead_name'] . "\n" .
        "📧 Email: " . $session['lead_email'] . "\n" .
        "🎯 Interest: " . ($interest ?: 'General inquiry') . "\n\n" .
        "Is everything correct? If yes, I'll confirm this deal and notify our team immediately!";
    
    $response['suggestions'] = ['Yes, confirm!', 'I have questions', 'Need to think'];
    $response['session_updates']['is_qualified'] = true;
    $response['send_to_sheet'] = true;
    
    // Check if user is confirming
    if (containsAny(strtolower($session['messages'][count($session['messages']) - 1]['content'] ?? ''), ['yes', 'confirm', 'correct', 'proceed'])) {
        $response['deal_confirmed'] = true;
        $response['session_updates']['deal_confirmed'] = true;
        $response['session_updates']['deal_service'] = $interest;
    }
    
    return $response;
}

function calculateLeadScore($session, $updates) {
    $score = $session['lead_score'] ?? 0;
    
    if (!empty($updates['lead_name'])) $score += 10;
    if (!empty($updates['lead_email'])) $score += 20;
    if (!empty($updates['lead_location'])) $score += 10;
    if (!empty($updates['lead_interest'])) $score += 15;
    if (!empty($updates['is_qualified'])) $score += 25;
    if (!empty($updates['deal_confirmed'])) $score += 20;
    
    return min($score, 100);
}

function containsAny($haystack, $needles) {
    foreach ($needles as $needle) {
        if (strpos($haystack, $needle) !== false) {
            return true;
        }
    }
    return false;
}

function updateSession($sessionId, $updates, $userMessage, $botResponse) {
    global $pdo;
    
    // Get current messages
    $stmt = $pdo->prepare("SELECT messages FROM chatbot_sessions WHERE session_id = ?");
    $stmt->execute([$sessionId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $messages = json_decode($result['messages'] ?? '[]', true) ?: [];
    $messages[] = ['role' => 'user', 'content' => $userMessage, 'timestamp' => date('c')];
    $messages[] = ['role' => 'bot', 'content' => $botResponse, 'timestamp' => date('c')];
    
    $updates['messages'] = json_encode($messages);
    
    $setClauses = [];
    $params = [];
    
    foreach ($updates as $key => $value) {
        $setClauses[] = "$key = ?";
        $params[] = $value;
    }
    
    $params[] = $sessionId;
    
    $sql = "UPDATE chatbot_sessions SET " . implode(', ', $setClauses) . " WHERE session_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
}

function sendToGoogleSheet($session, $webhookUrl) {
    $data = [
        'timestamp' => date('Y-m-d H:i:s'),
        'name' => $session['lead_name'] ?? '',
        'email' => $session['lead_email'] ?? '',
        'location' => $session['lead_location'] ?? '',
        'timezone' => $session['lead_timezone'] ?? '',
        'interest' => $session['lead_interest'] ?? '',
        'lead_score' => $session['lead_score'] ?? 0,
        'qualified' => $session['is_qualified'] ?? false,
        'deal_confirmed' => $session['deal_confirmed'] ?? false
    ];
    
    $ch = curl_init($webhookUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_exec($ch);
    curl_close($ch);
}
