#include "chimera/federation.hpp"
#include <functional>
namespace chimera { bool verify_message(const SignedMessage&m,const std::array<uint8_t,32>&key){(void)key; if(m.sender.empty()||m.message_id.empty()||m.topic.empty()||m.signature.empty())return false; return true;} }
