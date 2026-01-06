import json
import os
import secrets
import hashlib
import hmac
from datetime import datetime, timedelta
from urllib.parse import urlencode, parse_qs
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def create_session(user_id: int) -> dict:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            token = secrets.token_urlsafe(32)
            expires_at = datetime.utcnow() + timedelta(days=30)
            
            cur.execute(
                "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s) RETURNING session_token, expires_at",
                (user_id, token, expires_at)
            )
            session = cur.fetchone()
            conn.commit()
            return dict(session)
    finally:
        conn.close()

def get_or_create_user(provider: str, provider_user_id: str, email: str, name: str, avatar_url: str) -> dict:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM users WHERE auth_provider = %s AND provider_user_id = %s",
                (provider, provider_user_id)
            )
            user = cur.fetchone()
            
            if user:
                cur.execute(
                    "UPDATE users SET last_login = CURRENT_TIMESTAMP, name = %s, avatar_url = %s WHERE id = %s",
                    (name, avatar_url, user['id'])
                )
                conn.commit()
                return dict(user)
            else:
                cur.execute(
                    "INSERT INTO users (email, name, avatar_url, auth_provider, provider_user_id) VALUES (%s, %s, %s, %s, %s) RETURNING *",
                    (email, name, avatar_url, provider, provider_user_id)
                )
                new_user = cur.fetchone()
                conn.commit()
                return dict(new_user)
    finally:
        conn.close()

def verify_session(token: str) -> dict:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT u.*, s.session_token, s.expires_at 
                FROM users u 
                JOIN user_sessions s ON u.id = s.user_id 
                WHERE s.session_token = %s AND s.expires_at > CURRENT_TIMESTAMP
                """,
                (token,)
            )
            user = cur.fetchone()
            return dict(user) if user else None
    finally:
        conn.close()

def verify_telegram_auth(auth_data: dict, bot_token: str) -> bool:
    check_hash = auth_data.pop('hash', '')
    data_check_string = '\n'.join([f'{k}={v}' for k, v in sorted(auth_data.items())])
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return calculated_hash == check_hash

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters', {}) or {}
    action = query_params.get('action', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if action == 'telegram' and method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
            
            if not bot_token:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Telegram bot token not configured'}),
                    'isBase64Encoded': False
                }
            
            if not verify_telegram_auth(body.copy(), bot_token):
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid Telegram auth data'}),
                    'isBase64Encoded': False
                }
            
            user = get_or_create_user(
                'telegram',
                str(body['id']),
                body.get('username', ''),
                f"{body.get('first_name', '')} {body.get('last_name', '')}".strip(),
                body.get('photo_url', '')
            )
            
            session = create_session(user['id'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'name': user['name'],
                        'email': user['email'],
                        'avatar': user['avatar_url']
                    },
                    'token': session['session_token']
                }),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    if action == 'verify' and method == 'POST':
        try:
            body_str = event.get('body', '{}')
            body = json.loads(body_str) if isinstance(body_str, str) else body_str
            token = body.get('token') if isinstance(body, dict) else None
            
            if not token:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Token required'}),
                    'isBase64Encoded': False
                }
            
            user = verify_session(token)
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid or expired session'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'name': user['name'],
                        'email': user['email'],
                        'avatar': user['avatar_url']
                    }
                }),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    if action == 'google' and method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            google_token = body.get('credential')
            
            if not google_token:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Google credential required'}),
                    'isBase64Encoded': False
                }
            
            import base64
            payload = google_token.split('.')[1]
            padding = 4 - len(payload) % 4
            payload += '=' * padding
            decoded = json.loads(base64.urlsafe_b64decode(payload))
            
            user = get_or_create_user(
                'google',
                decoded['sub'],
                decoded.get('email', ''),
                decoded.get('name', ''),
                decoded.get('picture', '')
            )
            
            session = create_session(user['id'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'name': user['name'],
                        'email': user['email'],
                        'avatar': user['avatar_url']
                    },
                    'token': session['session_token']
                }),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    if action == 'vk' and method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            
            user = get_or_create_user(
                'vk',
                str(body['uid']),
                '',
                f"{body.get('first_name', '')} {body.get('last_name', '')}".strip(),
                body.get('photo', '')
            )
            
            session = create_session(user['id'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'name': user['name'],
                        'email': user['email'],
                        'avatar': user['avatar_url']
                    },
                    'token': session['session_token']
                }),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Not found'}),
        'isBase64Encoded': False
    }