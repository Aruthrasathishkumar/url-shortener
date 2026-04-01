BASE62_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

def encode(num: int) -> str:
    if num == 0:
        return BASE62_CHARS[0]
    
    result = []
    while num > 0:
        result.append(BASE62_CHARS[num % 62])
        num //= 62
    
    return "".join(reversed(result))

def decode(code: str) -> int:
    result = 0
    for char in code:
        result = result * 62 + BASE62_CHARS.index(char)
    return result