Unofficial ANTLabs Toolkit
==========================

This is a chrome extension, [published in the webstore](https://chrome.google.com/webstore/detail/unofficial-antlabs-toolki/eblaaomcjiflgebdkbniboahjmhcednb?hl=en&gl=US), for managing ANTLabs innGate products.

This toolkit was started to solve one problem: delete accumulated accounts that the system failed to delete automatically.  Accounts can accumulate in an innGate for two reasons:

1. the account was created without a valid_until (expiration) date.
2. the valid_until date passed, but the innGate failed to delete the account.

The innGate API provides a method to delete accounts en masse, but the API doesn't always work.  We have found greater reliability for fixing innGates using the administrative UI.  When gateways become overburdened with too many accounts, they tend to slow down and exhibit errors.  Whether this is the cause of the API's instability is unknown; all that is known is that in extreme cases, the API will not be able to delete the accounts.  Luckily, in these cases, the administrative UI can still delete the unwanted accounts. That's what this chrome extension does - uses scripting to iterate through the UI of an innGate to delete accounts in accordance with user-specified options.
